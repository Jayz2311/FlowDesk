import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { createTask, updateTask } from '../controllers/taskController.js';

const router = express.Router();

router.use(authenticate);

router.post('/', createTask);
router.patch('/:id', updateTask);

export default router;
