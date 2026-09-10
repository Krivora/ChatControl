// src/controllers/whatsapp.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { WhatsAppService } from "../services/whatsapp.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ok } from "../utils/ApiResponse.js";

// 📩 Enviar mensaje manualmente al cliente desde el panel
export const sendMessage = asyncHandler(async (req, res) => {
  const { to, body, conversation_id } = req.body ?? {};

  if (!to || !body || !conversation_id) {
    throw new ApiError(400, "Faltan campos: 'to', 'body' y 'conversation_id'");
  }

  // El controller sólo traduce HTTP: el envío y el registro del mensaje son
  // una sola operación de negocio y viven en el service. Antes esta función
  // importaba `pool` y lanzaba el INSERT directamente, saltándose las capas
  // de servicio y repositorio.
  const result = await WhatsAppService.sendAndRecord({
    to,
    body,
    conversationId: conversation_id,
  });

  return ok(res, result);
});
