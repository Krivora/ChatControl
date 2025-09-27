// src/controllers/messages.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { MessagesService } from "../services/messages.service.js";
import { ok } from "../utils/ApiResponse.js";

export const createMessage = asyncHandler(async (req, res) => {
  const msg = await MessagesService.create(req);
  return ok(res, msg);
});
