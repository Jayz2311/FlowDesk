import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { createTask, updateTask, deleteTask } from '../controllers/taskController.js';

const router = express.Router();

router.use(authenticate);

router.post('/', createTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
