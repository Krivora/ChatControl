// src/routes/users.routes.js
import { Router } from 'express';
import { register, listUsers, getUser, login } from '../controllers/users.controller.js';
import { validate } from '../middlewares/validate.js';
import { registerUserSchema, loginUserSchema } from '../validators/users.validators.js';
import { requireAuth } from '../middlewares/auth.js';
import { updateDarkMode } from '../controllers/users.controller.js';
import { createUser, updateUser } from '../controllers/users.controller.js';

const r = Router();

// Registro con validación
r.post('/register', validate(registerUserSchema), register);

// Login con validación
r.post('/login', validate(loginUserSchema), login);

// Listado y detalle requieren auth
r.get('/', requireAuth, listUsers);
r.get('/:id', requireAuth, getUser);

r.patch('/dark-mode', requireAuth, updateDarkMode);

r.post('/', requireAuth, createUser);     
r.put('/:id', requireAuth, updateUser);     

export default r;
