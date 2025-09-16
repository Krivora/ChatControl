// src/routes/answers.routes.js
import { Router } from 'express';
import { listAnswers, getAnswerByKey } from '../controllers/answers.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const r = Router();

// GET /api/answers/conversation/:conversationId
r.get('/conversation/:conversationId', requireAuth, listAnswers);

// GET /api/answers/conversation/:conversationId/:key
r.get('/conversation/:conversationId/:key', requireAuth, getAnswerByKey);

export default r;