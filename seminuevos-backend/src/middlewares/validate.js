// src/middlewares/validate.js
import { ApiError } from '../utils/ApiError.js';

/**
 * Valida `req[property]` contra un esquema Zod.
 *
 * Dos correcciones respecto a la versión anterior:
 *
 * 1. Zod 4 expone los problemas en `error.issues`; se leía `error.errors`,
 *    que ya no existe, así que `details` siempre llegaba como undefined y el
 *    cliente recibía "Datos inválidos" sin decir qué campo falló.
 * 2. Se descartaba el resultado de `parse()`. Ahora se reasigna, de modo que
 *    las coerciones y los `default` del esquema llegan al controller y los
 *    campos no declarados quedan fuera.
 */
export const validate = (schema, property = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[property]);

  if (!result.success) {
    const issues = result.error.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    }));
    return next(new ApiError(400, 'Datos inválidos', issues));
  }

  // req.query y req.params son getters de sólo lectura en Express 5.
  if (property === 'body') {
    req.body = result.data;
  } else {
    req.validated = { ...(req.validated || {}), [property]: result.data };
  }

  next();
};
