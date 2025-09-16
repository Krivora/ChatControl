// src/controllers/conversations.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { ConversationsService } from '../services/conversations.service.js';
import { ok } from '../utils/ApiResponse.js';

export const listCustomerConversations = asyncHandler(async (req, res) => {
  const { items, meta } = await ConversationsService.listByCustomer(req);
  return ok(res, items, meta);
});

export const getConversationWithMessages = asyncHandler(async (req, res) => {
  const result = await ConversationsService.getWithMessages(req);
  return ok(res, result);
});
