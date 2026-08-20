// src/controllers/reports.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { ReportsService } from '../services/reports.service.js';
import { ok } from '../utils/ApiResponse.js';

export const getOverview = asyncHandler(async (req, res) => {
  const data = await ReportsService.overview(req);
  return ok(res, data);
});

export const getDataset = asyncHandler(async (req, res) => {
  const { rows, columns, meta, type, range } = await ReportsService.dataset(req);
  return ok(res, { type, range, columns, rows }, meta);
});

export const getDatasetTypes = asyncHandler(async (_req, res) => {
  return ok(res, ReportsService.datasetTypes);
});
