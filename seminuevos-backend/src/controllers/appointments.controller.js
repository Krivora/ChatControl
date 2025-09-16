// src/controllers/appointments.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppointmentsService } from '../services/appointments.service.js';
import { ok } from '../utils/ApiResponse.js';

export const listAppointments = asyncHandler(async (req, res) => {
  const { items, meta } = await AppointmentsService.list(req);
  return ok(res, items, meta);
});

export const getAppointment = asyncHandler(async (req, res) => {
  const appt = await AppointmentsService.get(req);
  return ok(res, appt);
});

export const createAppointment = asyncHandler(async (req, res) => {
  const appt = await AppointmentsService.create(req);
  return ok(res, appt);
});

export const updateAppointment = asyncHandler(async (req, res) => {
  const appt = await AppointmentsService.update(req);
  return ok(res, appt);
});

export const deleteAppointment = asyncHandler(async (req, res) => {
  const result = await AppointmentsService.remove(req);
  return ok(res, result);
});
