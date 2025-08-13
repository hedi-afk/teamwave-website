import express from 'express';
import {
  getAllRegistrations,
  getRegistrationStats,
  getRegistrationsByEvent,
  getRegistrationById,
  createRegistration,
  updateRegistrationStatus,
  bulkUpdateStatus,
  deleteRegistration,
  bulkDeleteRegistrations
} from '../controllers/registrationController';

const router = express.Router();

// Public routes
router.post('/', createRegistration);

// Admin routes
router.get('/', getAllRegistrations);
router.get('/stats', getRegistrationStats);
router.get('/event/:eventId', getRegistrationsByEvent);
router.get('/:id', getRegistrationById);
router.patch('/:id/status', updateRegistrationStatus);
router.patch('/bulk/status', bulkUpdateStatus);
router.delete('/:id', deleteRegistration);
router.delete('/bulk', bulkDeleteRegistrations);

export default router; 