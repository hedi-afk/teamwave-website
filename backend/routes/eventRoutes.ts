import express, { Request } from 'express';
import {
  getAllEvents,
  getEventById,
  getEventsByGame,
  getEventsByStatus,
  getUpcomingEvents,
  createEvent,
  updateEvent,
  deleteEvent
} from '../controllers/eventController';
import upload from '../middleware/uploadMiddleware';

// Extend Request type to include file property
interface MulterRequest extends Request {
  file?: any;
}

const router = express.Router();

// Get all events
router.get('/', getAllEvents);

// Get upcoming events
router.get('/upcoming', getUpcomingEvents);

// Get events by game
router.get('/game/:game', getEventsByGame);

// Get events by status
router.get('/status/:status', getEventsByStatus);

// Image upload for event
router.post('/upload', upload.single('image'), (req: MulterRequest, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  // Return the path to the uploaded file
  const imagePath = `images/${req.file.filename}`;
  return res.status(200).json({ imagePath });
});

// Get event by ID - this must come after all other GET routes with specific paths
router.get('/:id', getEventById);

// Create new event
router.post('/', createEvent);

// Update event
router.put('/:id', updateEvent);

// Delete event
router.delete('/:id', deleteEvent);

export default router; 