import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { createProject, getProjects, getProjectDetails, addMember } from '../controllers/projectController.js';

const router = express.Router();

router.use(authenticate);

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProjectDetails);
router.post('/:id/members', addMember);

export default router;
