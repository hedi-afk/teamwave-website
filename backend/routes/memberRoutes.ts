import express from 'express';
import {
  getAllMembers,
  getMemberById,
  getMemberByUsername,
  getMembersByTeam,
  getMembersByGame,
  createMember,
  updateMember,
  deleteMember
} from '../controllers/memberController';
import upload from '../middleware/uploadMiddleware';

const router = express.Router();

// Get all members
router.get('/', getAllMembers);

// Get member by username (this route needs to come before the ID route to avoid conflicts)
router.get('/username/:username', getMemberByUsername);

// Get members by team
router.get('/team/:team', getMembersByTeam);

// Get members by game
router.get('/game/:game', getMembersByGame);

// Image upload for member
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  console.log('File uploaded:', req.file);
  
  // Return the path to the uploaded file
  const imagePath = `images/${req.file.filename}`;
  console.log('Returning image path:', imagePath);
  console.log('Full image URL would be:', `${req.protocol}://${req.get('host')}/uploads/${imagePath}`);
  
  return res.status(200).json({ imagePath });
});

// Get member by ID
router.get('/:id', getMemberById);

// Create new member
router.post('/', createMember);

// Update member
router.put('/:id', updateMember);

// Delete member
router.delete('/:id', deleteMember);

export default router; 