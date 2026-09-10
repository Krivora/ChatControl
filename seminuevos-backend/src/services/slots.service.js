// src/services/slots.service.js
import { SlotsRepo } from '../repositories/slots.repo.js';
import { ApiError } from '../utils/ApiError.js';

export const SlotsService = {
  /** @param {{ weekday?: number|null, active?: boolean|null }} input */
  async list({ weekday = null, active = null } = {}) {
    return SlotsRepo.list({ weekday, active });
  },

  /** @param {{ date: string }} input - fecha en formato YYYY-MM-DD */
  async availableByDate({ date }) {
    // Falta un parámetro de la petición: es un 400, no un 500.
    if (!date) throw new ApiError(400, 'Debes especificar ?date=YYYY-MM-DD');
    return SlotsRepo.availableForDate(date);
  },
};
