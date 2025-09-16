// src/routes/conversations.routes.js
import { Router } from 'express';
import {
  listCustomerConversations,
  getConversationWithMessages
} from '../controllers/conversations.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const r = Router();

// GET /api/conversations/customer/:customerId?page=1&pageSize=10
r.get('/customer/:customerId',requireAuth, listCustomerConversations);

// GET /api/conversations/:id?page=1&pageSize=20
r.get('/:id', requireAuth, getConversationWithMessages);

export default r;
