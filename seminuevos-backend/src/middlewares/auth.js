// src/middlewares/auth.js
import { verifyToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';


export const requireAuth = (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'No autorizado: falta el token de sesión'));
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    return next(new ApiError(401, 'No autorizado: falta el token de sesión'));
  }

  try {
    req.user = verifyToken(token);
  } catch (err) {
    const expired = err.name === 'TokenExpiredError';
    return next(new ApiError(401, expired ? 'La sesión expiró' : 'Token inválido'));
  }

  next();
};
