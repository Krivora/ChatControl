// src/controllers/messages.controller.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { MessagesService } from '../services/messages.service.js';
import { ApiError } from '../utils/ApiError.js';
import { ok } from '../utils/ApiResponse.js';

export const createMessage = asyncHandler(async (req, res) => {
  const { conversation_id, content, content_type } = req.body ?? {};

  if (!conversation_id || !content) {
    throw new ApiError(400, "Faltan campos: 'conversation_id' y 'content'");
  }

  const msg = await MessagesService.create({
    conversationId: conversation_id,
    content,
    contentType: content_type,
  });
  return ok(res, msg);
});

export const listMessagesByConversation = asyncHandler(async (req, res) => {
  const { conversation_id } = req.query;

  // Lanzar en vez de responder aquí: el manejador central decide el código y
  // mantiene el contrato { ok, message, details } del resto de la API.
  if (!conversation_id) throw new ApiError(400, 'conversation_id es requerido');

  const messages = await MessagesService.listByConversation({
    conversationId: conversation_id,
  });
  return ok(res, messages);
});
