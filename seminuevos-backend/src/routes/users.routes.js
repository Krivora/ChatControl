// src/routes/users.routes.js
import { Router } from 'express';
import { register, listUsers, getUser, login } from '../controllers/users.controller.js';
import { validate } from '../middlewares/validate.js';
import { registerUserSchema, loginUserSchema } from '../validators/users.validators.js';
import { requireAuth } from '../middlewares/auth.js';
import { deleteUser } from '../controllers/users.controller.js';
import { updateDarkMode } from '../controllers/users.controller.js';
import { createUser, updateUser } from '../controllers/users.controller.js';

const r = Router();

// Registro público (para que alguien se cree una cuenta)
r.post('/register', validate(registerUserSchema), register);

// Login
r.post('/login', validate(loginUserSchema), login);

// Listado y detalle (requiere auth)
r.get('/', requireAuth, listUsers);
r.get('/:id', requireAuth, getUser);

// Creación interna (solo admin puede crear usuarios)
r.post('/', requireAuth, validate(registerUserSchema), createUser);

// Update, delete
r.put('/:id', requireAuth, updateUser);
r.delete('/:id', requireAuth, deleteUser);

// Toggle darkMode
r.patch('/dark-mode', requireAuth, updateDarkMode);
export default r;
