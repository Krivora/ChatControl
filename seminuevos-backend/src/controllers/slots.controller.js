// src/controllers/slots.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { SlotsService } from '../services/slots.service.js';
import { ok } from '../utils/ApiResponse.js';

export const listSlots = asyncHandler(async (req, res) => {
  const data = await SlotsService.list(req);
  return ok(res, data);
});

export const availableByDate = asyncHandler(async (req, res) => {
  const data = await SlotsService.availableByDate(req);
  return ok(res, data);
});
