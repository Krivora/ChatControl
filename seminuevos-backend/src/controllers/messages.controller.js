import { asyncHandler } from "../utils/asyncHandler.js";
import { MessagesService } from "../services/messages.service.js";
import { ok } from "../utils/ApiResponse.js";

export const createMessage = asyncHandler(async (req, res) => {
  const msg = await MessagesService.create(req);
  return ok(res, msg);
});

// Nuevo endpoint para listar mensajes por conversación
export const listMessagesByConversation = asyncHandler(async (req, res) => {
  const { conversation_id } = req.query;
  if (!conversation_id) return res.status(400).json({ error: "conversation_id es requerido" });

  const messages = await MessagesService.listByConversation(conversation_id);
  return ok(res, messages);
});
