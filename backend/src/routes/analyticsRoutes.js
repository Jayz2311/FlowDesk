import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getAnalyticsStats } from '../controllers/analyticsController.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAnalyticsStats);

export default router;
