// src/utils/pagination.js
import { env } from '../config/env.js';

/**
 * Normaliza los parámetros de paginación.
 *
 * Recibe un objeto plano de query, no el `req` de Express: así este utilitario
 * deja de depender del framework de entrega y puede usarse desde un job o un
 * comando de consola igual que desde un controller.
 *
 * @param {{ page?: unknown, pageSize?: unknown }} query
 */
export const parsePagination = (query = {}) => {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(
    env.MAX_PAGE_SIZE,
    Math.max(1, Number(query.pageSize) || env.DEFAULT_PAGE_SIZE)
  );

  return { page, pageSize, offset: (page - 1) * pageSize, limit: pageSize };
};
