// src/controllers/reports.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { ReportsService } from '../services/reports.service.js';
import { ok } from '../utils/ApiResponse.js';

export const getOverview = asyncHandler(async (req, res) => {
  const { from, to, granularity } = req.query;
  const data = await ReportsService.overview({ from, to, granularity });
  return ok(res, data);
});

export const getDataset = asyncHandler(async (req, res) => {
  const { type, from, to, q, page, pageSize } = req.query;
  const { rows, columns, meta, type: resolvedType, range } = await ReportsService.dataset({
    type,
    from,
    to,
    q,
    page,
    pageSize,
  });
  return ok(res, { type: resolvedType, range, columns, rows }, meta);
});

export const getDatasetTypes = asyncHandler(async (_req, res) => {
  return ok(res, ReportsService.datasetTypes);
});
