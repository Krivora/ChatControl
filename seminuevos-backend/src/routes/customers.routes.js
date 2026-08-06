// src/routes/customers.routes.js
import { Router } from 'express';
import { listCustomers, getCustomer, updateCustomer } from '../controllers/customers.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const r = Router();

// GET /api/customers?page=1&pageSize=10&q=aldo
r.get('/', requireAuth,listCustomers);

// GET /api/customers/:id
r.get('/:id', requireAuth,getCustomer);

// PUT /api/customers/:id  -> renombrar cliente
r.put('/:id', requireAuth, updateCustomer);

export default r;
