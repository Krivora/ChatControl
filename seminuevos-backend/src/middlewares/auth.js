// src/middlewares/auth.js
import { verifyToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';

export const requireAuth = (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new ApiError(401, 'No autorizado: token faltante');
    }

    const token = header.split(' ')[1];
    const decoded = verifyToken(token);

    req.user = decoded; // lo dejamos en req.user
    next();
  } catch (err) {
    next(new ApiError(401, 'Token inválido o expirado'));
  }
};
