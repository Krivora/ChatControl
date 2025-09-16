// src/controllers/conversations.controller.js
import { ConversationsService } from "../services/conversations.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/ApiResponse.js";


  export const list= asyncHandler(async (req, res) => {
    const { items, meta } = await ConversationsService.list(req);
    return ok(res, items, meta);
  });

export const getFull = asyncHandler(async (req, res) => {
  const data = await ConversationsService.getFull(req);
  return ok(res, data); // 🔹 NO lo destructures como {items, meta}
});