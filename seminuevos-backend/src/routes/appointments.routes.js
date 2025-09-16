// src/routes/appointments.routes.js
import { Router } from 'express';
import {
  listAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment
} from '../controllers/appointments.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const r = Router();

// GET /api/appointments?dateFrom=2025-09-15&status=confirmed
r.get('/', requireAuth,listAppointments);

// GET /api/appointments/:id
r.get('/:id', requireAuth,getAppointment);

// POST /api/appointments
r.post('/', requireAuth,createAppointment);

// PUT /api/appointments/:id
r.put('/:id',requireAuth,updateAppointment);

// DELETE /api/appointments/:id
r.delete('/:id', requireAuth,deleteAppointment);

export default r;
