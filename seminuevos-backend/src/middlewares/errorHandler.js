// src/middlewares/errorHandler.js
import { ApiError } from '../utils/ApiError.js';
import { fail } from '../utils/ApiResponse.js';

export const notFound = (req, res, next) => {
  next(new ApiError(404, `No se encontró el recurso: ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  // Si es un ApiError lanzado por nosotros
  if (err instanceof ApiError) {
    return fail(res, err.status, err.message, err.details);
  }

  // Otros errores (ej. SQL, excepciones)
  console.error('[Error]', err);

  return fail(res, 500, 'Error interno del servidor');
};
