// src/routes/messages.routes.js
import { Router } from 'express';
import { listMessages } from '../controllers/messages.controller.js';
import { requireAuth } from '../middlewares/auth.js';
const r = Router();

// GET /api/messages/conversation/:conversationId?page=1&pageSize=20
r.get('/conversation/:conversationId', requireAuth, listMessages);

export default r;
