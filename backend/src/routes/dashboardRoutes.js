import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getDashboardStats } from '../controllers/dashboardController.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getDashboardStats);

export default router;
