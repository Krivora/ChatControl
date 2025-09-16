// src/routes/assignments.routes.js
import { Router } from 'express';
import {
  listAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment
} from '../controllers/assignments.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const r = Router();

// GET /api/assignments/conversation/:conversationId
r.get('/conversation/:conversationId', requireAuth, listAssignments);

// GET /api/assignments/:id
r.get('/:id', requireAuth, getAssignment);

// POST /api/assignments
r.post('/', requireAuth,createAssignment);

// PUT /api/assignments/:id
r.put('/:id',requireAuth, updateAssignment);

// DELETE /api/assignments/:id
r.delete('/:id',requireAuth,deleteAssignment);

export default r;
