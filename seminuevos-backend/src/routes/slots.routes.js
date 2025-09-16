// src/routes/slots.routes.js
import { Router } from 'express';
import { listSlots, availableByDate } from '../controllers/slots.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const r = Router();

// GET /api/slots?weekday=3&active=true
r.get('/', requireAuth,listSlots);

// GET /api/slots/available?date=2025-09-17
r.get('/available',requireAuth, availableByDate);

export default r;
