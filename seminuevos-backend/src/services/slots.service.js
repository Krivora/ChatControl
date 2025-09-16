// src/services/slots.service.js
import { SlotsRepo } from '../repositories/slots.repo.js';

export const SlotsService = {
  async list(req) {
    const weekday = req.query.weekday ? Number(req.query.weekday) : null;
    const active = req.query.active ? req.query.active === 'true' : null;
    return SlotsRepo.list({ weekday, active });
  },

  async availableByDate(req) {
    const { date } = req.query; // YYYY-MM-DD
    if (!date) {
      throw new Error('Debes especificar ?date=YYYY-MM-DD');
    }
    return SlotsRepo.availableForDate(date);
  }
};
