// src/controllers/conversations.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { ConversationsService } from '../services/conversations.service.js';
import { parsePagination } from '../utils/pagination.js';
import { ok } from '../utils/ApiResponse.js';

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await ConversationsService.list(parsePagination(req.query));
  return ok(res, items, meta);
});

export const getFull = asyncHandler(async (req, res) => {
  const data = await ConversationsService.getFull({ id: req.params.id });
  return ok(res, data);
});
