import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { createProject, getProjects, getProjectDetails, addMember, updateMemberRole, removeMember } from '../controllers/projectController.js';

const router = express.Router();

router.use(authenticate);

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProjectDetails);
router.post('/:id/members', addMember);
router.patch('/:id/members/:memberId', updateMemberRole);
router.delete('/:id/members/:memberId', removeMember);

export default router;
