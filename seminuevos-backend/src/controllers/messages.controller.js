// src/controllers/messages.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { MessagesService } from '../services/messages.service.js';
import { ok } from '../utils/ApiResponse.js';

export const listMessages = asyncHandler(async (req, res) => {
  const { items, meta } = await MessagesService.list(req);
  return ok(res, items, meta);
});
