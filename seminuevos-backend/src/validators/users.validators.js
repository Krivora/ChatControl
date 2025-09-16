// src/validators/users.validators.js
import { z } from 'zod';

export const registerUserSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  apellido: z.string().min(1, 'El apellido es obligatorio'),
  email: z.string().email('Email inválido'),
  telefono: z.string().min(7, 'Teléfono inválido').optional(),
  fecha_nacimiento: z.string().refine((d) => !isNaN(Date.parse(d)), {
    message: 'Fecha inválida, debe ser YYYY-MM-DD',
  }),
  genero: z.enum(['M', 'F', 'Otro']),
  password: z.string().min(6, 'El password debe tener al menos 6 caracteres'),
});

export const loginUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'El password debe tener al menos 6 caracteres'),
});
