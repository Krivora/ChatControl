// src/middlewares/errorHandler.js
//
// Único punto de traducción de errores a respuestas HTTP. Los controllers
// lanzan (vía asyncHandler) y aquí se decide el código y el cuerpo, de forma
// que el contrato { ok, message, details } sea el mismo en toda la API.
import { ApiError } from '../utils/ApiError.js';
import { fail } from '../utils/ApiResponse.js';
import { env } from '../config/env.js';

export const notFound = (req, _res, next) => {
  next(new ApiError(404, `No se encontró el recurso: ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, _next) => {
  // Errores de negocio que lanzamos nosotros: ya traen código y mensaje.
  if (err instanceof ApiError) {
    return fail(res, err.status, err.message, err.details);
  }

  // Origen rechazado por la lista blanca de CORS: es un 403, no un 500.
  if (err?.message?.startsWith('Origen no permitido por CORS')) {
    return fail(res, 403, err.message);
  }

  // JSON malformado en el cuerpo (lo lanza express.json()).
  if (err?.type === 'entity.parse.failed') {
    return fail(res, 400, 'El cuerpo de la petición no es JSON válido');
  }
  if (err?.type === 'entity.too.large') {
    return fail(res, 413, 'El cuerpo de la petición excede el límite permitido');
  }

  // Violaciones de integridad de PostgreSQL: son culpa de la petición, no del
  // servidor, y devolverlas como 500 escondía el motivo real al cliente.
  if (err?.code === '23505') return fail(res, 409, 'El registro ya existe');
  if (err?.code === '23503') return fail(res, 409, 'El registro está referenciado por otro y no puede modificarse');
  if (err?.code === '22P02') return fail(res, 400, 'Formato de dato inválido');

  console.error(`[Error] ${req.method} ${req.originalUrl}`, err);

  // El detalle del error interno sólo se expone fuera de producción: un
  // stack de PostgreSQL filtra nombres de tablas y de columnas.
  return fail(res, 500, 'Error interno del servidor', env.isProd ? null : err.message);
};
