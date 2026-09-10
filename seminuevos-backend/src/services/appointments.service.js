// src/services/appointments.service.js
import { AppointmentsRepo } from '../repositories/appointments.repo.js';
import { ApiError } from '../utils/ApiError.js';

export const AppointmentsService = {
  /**
   * @param {{
   *   limit: number, offset: number, page: number, pageSize: number,
   *   filters?: { dateFrom?: string, dateTo?: string, status?: string, statuses?: string[], q?: string },
   *   order?: string
   * }} input
   */
  async list({ limit, offset, page, pageSize, filters = {}, order }) {
    const { dateFrom, dateTo, status, statuses, q } = filters;

    const [items, total, counts] = await Promise.all([
      AppointmentsRepo.list({ dateFrom, dateTo, status, statuses, q, order, limit, offset }),
      AppointmentsRepo.count({ dateFrom, dateTo, status, statuses, q }),
      AppointmentsRepo.countsByStatus({ dateFrom, dateTo, q }),
    ]);

    return { items, meta: { page, pageSize, total, counts } };
  },

  /** @param {{ id: string|number }} input */
  async get({ id }) {
    const appt = await AppointmentsRepo.getById(id);
    if (!appt) throw new ApiError(404, 'Cita no encontrada');
    return appt;
  },

  /** @param {object} data */
  async create(data) {
    return AppointmentsRepo.create(data);
  },

  /** @param {{ id: string|number, data: object }} input */
  async update({ id, data }) {
    const updated = await AppointmentsRepo.update(id, data);
    if (!updated) throw new ApiError(404, 'Cita no encontrada para actualizar');
    return updated;
  },

  /** @param {{ id: string|number }} input */
  async remove({ id }) {
    await AppointmentsRepo.delete(id);
    return { success: true };
  },

  /** @param {{ dateFrom?: string, dateTo?: string, status?: string }} input */
  async getDatesWithAppointments({ dateFrom, dateTo, status } = {}) {
    return AppointmentsRepo.getDatesWithAppointments({ dateFrom, dateTo, status });
  },
};
