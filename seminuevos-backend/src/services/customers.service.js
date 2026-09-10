// src/services/customers.service.js
import { CustomersRepo } from '../repositories/customers.repo.js';
import { ApiError } from '../utils/ApiError.js';

export const CustomersService = {
  /** @param {{ q?: string|null, limit: number, offset: number, page: number, pageSize: number }} input */
  async list({ q = null, limit, offset, page, pageSize }) {
    const [items, total] = await Promise.all([
      CustomersRepo.list({ q, limit, offset }),
      CustomersRepo.count({ q }),
    ]);

    return { items, meta: { page, pageSize, total } };
  },

  /** @param {{ id: string|number }} input */
  async get({ id }) {
    const customer = await CustomersRepo.getById(id);
    if (!customer) throw new ApiError(404, 'Cliente no encontrado');
    return customer;
  },

  /** @param {{ id: string|number, fullName: string }} input */
  async update({ id, fullName }) {
    const name = fullName?.trim();

    if (!name) throw new ApiError(400, 'El nombre no puede estar vacío');
    if (name.length > 120) throw new ApiError(400, 'El nombre es demasiado largo');

    const updated = await CustomersRepo.update(id, { full_name: name });
    if (!updated) throw new ApiError(404, 'Cliente no encontrado');
    return updated;
  },
};
