// src/utils/pagination.js
import { env } from '../config/env.js';

export const parsePagination = (req) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const pageSize = Math.min(
    env.MAX_PAGE_SIZE || 100,
    Math.max(1, Number(req.query.pageSize || env.DEFAULT_PAGE_SIZE || 20))
  );
  const offset = (page - 1) * pageSize;

  return { page, pageSize, offset, limit: pageSize };
};
