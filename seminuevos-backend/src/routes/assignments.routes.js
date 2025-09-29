import { Router } from 'express';
import {
  listAllAssignments,   // 👈 nuevo
  listAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment
} from '../controllers/assignments.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const r = Router();

// GET /api/assignments  -> todos los asignados
r.get('/', requireAuth, listAllAssignments);

// GET /api/assignments/conversation/:conversationId -> por conversación
r.get('/conversation/:conversationId', requireAuth, listAssignments);

// GET /api/assignments/:id
r.get('/:id', requireAuth, getAssignment);

// POST /api/assignments
r.post('/', requireAuth, createAssignment);

// PUT /api/assignments/:id
r.put('/:id', requireAuth, updateAssignment);

// DELETE /api/assignments/:id
r.delete('/:id', requireAuth, deleteAssignment);

export default r;
