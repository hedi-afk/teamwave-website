import { Request, Response } from 'express';
import Registration, { IRegistration } from '../models/Registration';
import Event from '../models/Event';
import mongoose from 'mongoose';

// GET all registrations with pagination and filtering
export const getAllRegistrations = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      eventId, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    // Build filter object
    const filter: any = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (eventId && eventId !== 'all') {
      filter.eventId = eventId;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { gameName: { $regex: search, $options: 'i' } },
        { team: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const registrations = await Registration.find(filter)
      .populate('eventId', 'name game startDate registrationDeadline')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Registration.countDocuments(filter);

    res.json({
      registrations,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET registration statistics
export const getRegistrationStats = async (req: Request, res: Response) => {
  try {
    const stats = await Registration.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get registrations by event
    const byEvent = await Registration.aggregate([
      {
        $group: {
          _id: '$eventId',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: '_id',
          as: 'event'
        }
      },
      {
        $unwind: '$event'
      },
      {
        $project: {
          eventName: '$event.name',
          count: 1
        }
      }
    ]);

    // Get recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentRegistrations = await Registration.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      overall: stats[0] || { total: 0, pending: 0, approved: 0, rejected: 0 },
      byEvent,
      recentRegistrations
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET registrations by event ID
export const getRegistrationsByEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { status, search } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const filter: any = { eventId };
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { gameName: { $regex: search, $options: 'i' } },
        { team: { $regex: search, $options: 'i' } }
      ];
    }

    const registrations = await Registration.find(filter)
      .populate('eventId', 'name game startDate registrationDeadline')
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET single registration by ID
export const getRegistrationById = async (req: Request, res: Response) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('eventId');
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    res.json(registration);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST create new registration
export const createRegistration = async (req: Request, res: Response) => {
  try {
    const { eventId, name, email, phoneNumber, gameName, gameId, team, message } = req.body;

    // Check if the event exists and is open for registration
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if the event is upcoming (can't register for past events)
    if (event.status !== 'upcoming') {
      return res.status(400).json({ message: 'Registration is closed for this event' });
    }

    // Check if registration deadline has passed
    if (event.registrationDeadline) {
      const registrationDeadline = new Date(event.registrationDeadline);
      if (registrationDeadline < new Date()) {
        return res.status(400).json({ message: 'Registration deadline has passed' });
      }
    }

    // Check for duplicate registration (same email for same event)
    const existingRegistration = await Registration.findOne({
      eventId,
      email: email.toLowerCase()
    });

    if (existingRegistration) {
      return res.status(400).json({ message: 'You have already registered for this event' });
    }

    // Create new registration
    const registration = new Registration({
      eventId,
      name,
      email: email.toLowerCase(),
      phoneNumber,
      gameName,
      gameId,
      team,
      message
    });

    const savedRegistration = await registration.save();
    
    // Populate event details for response
    await savedRegistration.populate('eventId', 'name game startDate');
    
    res.status(201).json({
      success: true,
      message: 'Registration successful! We will contact you with further details.',
      data: savedRegistration
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PATCH update registration status
export const updateRegistrationStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('eventId');
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    res.json(registration);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH bulk update registration statuses
export const bulkUpdateStatus = async (req: Request, res: Response) => {
  try {
    const { registrationIds, status } = req.body;
    
    if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
      return res.status(400).json({ message: 'Registration IDs array is required' });
    }
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const result = await Registration.updateMany(
      { _id: { $in: registrationIds } },
      { status }
    );
    
    res.json({
      message: `Updated ${result.modifiedCount} registrations`,
      modifiedCount: result.modifiedCount
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE registration
export const deleteRegistration = async (req: Request, res: Response) => {
  try {
    const registration = await Registration.findByIdAndDelete(req.params.id);
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    res.json({ message: 'Registration removed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE bulk delete registrations
export const bulkDeleteRegistrations = async (req: Request, res: Response) => {
  try {
    const { registrationIds } = req.body;
    
    if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
      return res.status(400).json({ message: 'Registration IDs array is required' });
    }
    
    const result = await Registration.deleteMany({
      _id: { $in: registrationIds }
    });
    
    res.json({
      message: `Deleted ${result.deletedCount} registrations`,
      deletedCount: result.deletedCount
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};


