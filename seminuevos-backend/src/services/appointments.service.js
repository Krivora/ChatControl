// src/services/appointments.service.js
import { AppointmentsRepo } from '../repositories/appointments.repo.js';
import { parsePagination } from '../utils/pagination.js';
import { ApiError } from '../utils/ApiError.js';

export const AppointmentsService = {
  async list(req) {
    const { limit, offset, page, pageSize } = parsePagination(req);
    const { dateFrom, dateTo, status } = req.query;

    const [items, total] = await Promise.all([
      AppointmentsRepo.list({ dateFrom, dateTo, status, limit, offset }),
      AppointmentsRepo.count({ dateFrom, dateTo, status })
    ]);

    return { items, meta: { page, pageSize, total } };
  },

  async get(req) {
    const { id } = req.params;
    const appt = await AppointmentsRepo.getById(id);
    if (!appt) throw new ApiError(404, 'Cita no encontrada');
    return appt;
  },

  async create(req) {
    const data = req.body;
    return AppointmentsRepo.create(data);
  },

  async update(req) {
    const { id } = req.params;
    const updated = await AppointmentsRepo.update(id, req.body);
    if (!updated) throw new ApiError(404, 'Cita no encontrada para actualizar');
    return updated;
  },

  async remove(req) {
    const { id } = req.params;
    await AppointmentsRepo.delete(id);
    return { success: true };
  }
};
