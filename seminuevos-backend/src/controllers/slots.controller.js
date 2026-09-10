// src/controllers/slots.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { SlotsService } from '../services/slots.service.js';
import { ok } from '../utils/ApiResponse.js';

export const listSlots = asyncHandler(async (req, res) => {
  // La conversión de los strings de la query es traducción de transporte:
  // el service recibe ya un número y un booleano.
  const data = await SlotsService.list({
    weekday: req.query.weekday ? Number(req.query.weekday) : null,
    active: req.query.active ? req.query.active === 'true' : null,
  });
  return ok(res, data);
});

export const availableByDate = asyncHandler(async (req, res) => {
  const data = await SlotsService.availableByDate({ date: req.query.date });
  return ok(res, data);
});
