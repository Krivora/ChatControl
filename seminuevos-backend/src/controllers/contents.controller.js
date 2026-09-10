// src/controllers/contents.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { ContentsService } from '../services/contents.service.js';
import { ok } from '../utils/ApiResponse.js';

export const listContents = asyncHandler(async (_req, res) => {
  const items = await ContentsService.list();
  return ok(res, items);
});

export const getContent = asyncHandler(async (req, res) => {
  const content = await ContentsService.get({ id: req.params.id });
  return ok(res, content);
});

export const updateContent = asyncHandler(async (req, res) => {
  const { name, type, content } = req.body ?? {};
  const updated = await ContentsService.update({ id: req.params.id, name, type, content });
  return ok(res, updated);
});
