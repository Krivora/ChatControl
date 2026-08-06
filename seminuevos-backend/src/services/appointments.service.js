// src/services/appointments.service.js
import { AppointmentsRepo } from '../repositories/appointments.repo.js';
import { parsePagination } from '../utils/pagination.js';
import { ApiError } from '../utils/ApiError.js';

export const AppointmentsService = {
  async list(req) {
    const { limit, offset, page, pageSize } = parsePagination(req);
    const { dateFrom, dateTo, status, statuses, q, order } = req.query;

    // `statuses` llega como lista separada por comas: pending,confirmed,...
    const statusList = statuses
      ? String(statuses).split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    const filters = { dateFrom, dateTo, status, statuses: statusList, q };

    const [items, total, counts] = await Promise.all([
      AppointmentsRepo.list({ ...filters, order, limit, offset }),
      AppointmentsRepo.count(filters),
      AppointmentsRepo.countsByStatus({ dateFrom, dateTo, q })
    ]);

    return { items, meta: { page, pageSize, total, counts } };
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
  },

  // 🔹 NUEVO
  async getDatesWithAppointments(req) {
    const { dateFrom, dateTo, status } = req.query;
    return AppointmentsRepo.getDatesWithAppointments({ dateFrom, dateTo, status });
  }
};
