import { Router } from 'express';
import {
  listAllAssignments,
  listAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment
} from '../controllers/assignments.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { authorizeRole } from '../middlewares/authorizeRole.js'; 
const r = Router();
r.get('/', requireAuth, listAllAssignments);
r.get('/conversation/:conversationId', requireAuth, listAssignments);
r.get('/:id', requireAuth, getAssignment);
r.post('/', requireAuth, authorizeRole('admin', 'super_admin'), createAssignment);
r.put('/:id', requireAuth, authorizeRole('admin', 'super_admin'), updateAssignment);
r.delete('/:id', requireAuth, authorizeRole('admin', 'super_admin'), deleteAssignment);

export default r;
