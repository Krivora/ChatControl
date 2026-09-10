// src/controllers/appointments.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppointmentsService } from '../services/appointments.service.js';
import { parsePagination } from '../utils/pagination.js';
import { ok } from '../utils/ApiResponse.js';

/**
 * `statuses` llega en la query como lista separada por comas
 * (`?statuses=pending,confirmed`). Desarmar esa cadena es traducción de
 * transporte, así que se hace aquí: el service recibe ya un array.
 */
const parseStatuses = (raw) =>
  raw
    ? String(raw)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : undefined;

export const listAppointments = asyncHandler(async (req, res) => {
  const { dateFrom, dateTo, status, statuses, q, order } = req.query;

  const { items, meta } = await AppointmentsService.list({
    ...parsePagination(req.query),
    filters: { dateFrom, dateTo, status, statuses: parseStatuses(statuses), q },
    order,
  });
  return ok(res, items, meta);
});

export const getAppointment = asyncHandler(async (req, res) => {
  const appt = await AppointmentsService.get({ id: req.params.id });
  return ok(res, appt);
});

export const createAppointment = asyncHandler(async (req, res) => {
  const appt = await AppointmentsService.create(req.body ?? {});
  return ok(res, appt);
});

export const updateAppointment = asyncHandler(async (req, res) => {
  const appt = await AppointmentsService.update({
    id: req.params.id,
    data: req.body ?? {},
  });
  return ok(res, appt);
});

export const deleteAppointment = asyncHandler(async (req, res) => {
  const result = await AppointmentsService.remove({ id: req.params.id });
  return ok(res, result);
});

export const getDatesWithAppointments = asyncHandler(async (req, res) => {
  const { dateFrom, dateTo, status } = req.query;
  const dates = await AppointmentsService.getDatesWithAppointments({ dateFrom, dateTo, status });
  return ok(res, dates);
});
