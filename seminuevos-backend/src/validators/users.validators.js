import { z } from 'zod';

// 📘 Validación para registrar usuario
export const registerUserSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  apellido: z.string().min(1, 'El apellido es obligatorio'),
  email: z.string().email('Email inválido'),
  telefono: z.string().min(7, 'Teléfono inválido').optional(),
  fecha_nacimiento: z
    .string()
    .refine((d) => !isNaN(Date.parse(d)), {
      message: 'Fecha inválida, debe ser YYYY-MM-DD',
    }),
  genero: z.enum(['M', 'F', 'Otro']),
  password: z.string().min(6, 'El password debe tener al menos 6 caracteres'),
  role_id: z
    .number({
      invalid_type_error: 'El rol debe ser numérico',
    })
    .int('El rol debe ser un número entero')
    .positive('El rol debe ser un número positivo')
    .optional(),
});
export const updateUserSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').optional(),
  apellido: z.string().min(1, 'El apellido es obligatorio').optional(),
  email: z.string().email('Email inválido').optional(),
  telefono: z.string().min(7, 'Teléfono inválido').optional(),
  fecha_nacimiento: z
    .string()
    .refine((d) => !isNaN(Date.parse(d)), {
      message: 'Fecha inválida, debe ser YYYY-MM-DD',
    })
    .optional(),
  genero: z.enum(['M', 'F', 'Otro']).optional(),
  password: z
    .string()
    .min(6, 'El password debe tener al menos 6 caracteres')
    .optional(),

  // 👇 Nuevo: role_id (para que solo los admins lo cambien)
  role_id: z
    .number({
      invalid_type_error: 'El rol debe ser numérico',
    })
    .int('El rol debe ser un número entero')
    .positive('El rol debe ser un número positivo')
    .optional(),
});

export const loginUserSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(6, 'El password debe tener al menos 6 caracteres'),
});
