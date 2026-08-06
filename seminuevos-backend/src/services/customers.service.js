// src/services/customers.service.js
import { CustomersRepo } from '../repositories/customers.repo.js';
import { parsePagination } from '../utils/pagination.js';
import { ApiError } from '../utils/ApiError.js';

export const CustomersService = {
  async list(req) {
    const { limit, offset, page, pageSize } = parsePagination(req);
    const q = req.query.q?.trim() || null;

    const [items, total] = await Promise.all([
      CustomersRepo.list({ q, limit, offset }),
      CustomersRepo.count({ q }),
    ]);

    return { items, meta: { page, pageSize, total } };
  },

  async get(req) {
    const id = req.params.id;
    const customer = await CustomersRepo.getById(id);
    if (!customer) throw new ApiError(404, 'Cliente no encontrado');
    return customer;
  },

  async update(req) {
    const id = req.params.id;
    const full_name = req.body?.full_name?.trim();

    if (!full_name) throw new ApiError(400, 'El nombre no puede estar vacío');
    if (full_name.length > 120) throw new ApiError(400, 'El nombre es demasiado largo');

    const updated = await CustomersRepo.update(id, { full_name });
    if (!updated) throw new ApiError(404, 'Cliente no encontrado');
    return updated;
  },
};
