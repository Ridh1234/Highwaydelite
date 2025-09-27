import express from 'express';
import { 
  getNotes, 
  getNote, 
  createNote, 
  updateNote, 
  deleteNote, 
  searchNotes 
} from '../controllers/noteController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

router.get('/', getNotes);
router.get('/search', searchNotes);
router.get('/:id', getNote);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;
