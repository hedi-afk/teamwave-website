import express, { Request, Response } from 'express';
import Registration, { IRegistration } from '../models/Registration';
import Event from '../models/Event';
import mongoose from 'mongoose';

const router = express.Router();

// POST create new registration
router.post('/', async (req: Request, res: Response) => {
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
    const registrationDeadline = new Date(event.registrationDeadline);
    if (registrationDeadline < new Date()) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }

    // Create new registration
    const registration = new Registration({
      eventId,
      name,
      email,
      phoneNumber,
      gameName,
      gameId,
      team,
      message
    });

    const savedRegistration = await registration.save();
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
});

// GET all registrations (admin only)
router.get('/', async (req: Request, res: Response) => {
  try {
    const registrations = await Registration.find().populate('eventId', 'name game startDate');
    res.json(registrations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET registrations by event ID (admin only)
router.get('/event/:eventId', async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const registrations = await Registration.find({ eventId });
    res.json(registrations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET registration by ID (admin only)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const registration = await Registration.findById(req.params.id).populate('eventId');
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    res.json(registration);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH update registration status (admin only)
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    res.json(registration);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE registration (admin only)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const registration = await Registration.findByIdAndDelete(req.params.id);
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    res.json({ message: 'Registration removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 