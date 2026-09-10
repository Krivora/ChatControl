// src/middlewares/rateLimit.js
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const jsonError = (_req, res) =>
  res.status(429).json({
    ok: false,
    message: 'Demasiadas peticiones. Inténtalo de nuevo en unos minutos.',
    details: null,
  });

/**
 * Límite estricto para el login: sin él, /api/users/login acepta fuerza bruta
 * de contraseñas a la velocidad que aguante la red.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.isProd ? 10 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: jsonError,
});

/** Techo general de la API, pensado para no molestar al uso normal del panel. */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: env.isProd ? 300 : 10_000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonError,
});
