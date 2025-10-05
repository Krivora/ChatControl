// src/routes/users.routes.js
import { Router } from 'express';
import {
  listUsers,
  getUser,
  login,
  deleteUser,
  updateDarkMode,
  createUser,
  updateUser
} from '../controllers/users.controller.js';
import { validate } from '../middlewares/validate.js';
import { registerUserSchema, loginUserSchema,updateUserSchema } from '../validators/users.validators.js';
import { requireAuth } from '../middlewares/auth.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';

const r = Router();

// Login
r.post('/login', validate(loginUserSchema), login);

// Listar todos los usuarios → Solo admin o super_admin
r.get('/', requireAuth, listUsers);

// Obtener detalle de usuario → cualquier usuario autenticado puede ver el suyo
r.get('/:id', requireAuth, getUser);

// Crear usuario interno → Solo admin o super_admin
r.post(
  '/',
  requireAuth,
  authorizeRole('admin', 'super_admin'),
  validate(registerUserSchema),
  createUser
);

// Actualizar usuario → puede hacerlo un admin o el mismo usuario
r.put('/:id', requireAuth, authorizeRole('admin', 'super_admin'), validate(updateUserSchema), updateUser);

// Eliminar usuario → Solo admin o super_admin
r.delete('/:id', requireAuth, authorizeRole('admin', 'super_admin'), deleteUser);

// Cambiar modo oscuro → cualquier usuario autenticado
r.patch('/dark-mode', requireAuth, updateDarkMode);

export default r;
