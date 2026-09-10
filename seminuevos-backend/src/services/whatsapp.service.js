// src/services/whatsapp.service.js
import { WhatsAppRepo } from "../repositories/whatsapp.repo.js";
import { MessagesRepo } from "../repositories/messages.repo.js";
import { ApiError } from "../utils/ApiError.js";

export const WhatsAppService = {
  /** Envío puro a la Cloud API, sin persistencia. Lo usa el job de seguimiento. */
  async sendTextMessage(to, body) {
    const { ok, data } = await WhatsAppRepo.sendTextMessage({ to, body });

    if (!ok) {
      const detail = data?.error?.message || "Error enviando mensaje";
      console.error("❌ Error WhatsApp API:", detail);
      // 502: el fallo es del proveedor externo, no de quien llamó a la API.
      throw new ApiError(502, `WhatsApp rechazó el envío: ${detail}`);
    }

    return data;
  },

  /**
   * Envía el mensaje y lo deja registrado en la conversación.
   *
   * El orden importa: primero el envío. Si se guardara antes, un rechazo de
   * la Cloud API dejaría en el historial un mensaje que el cliente nunca vio.
   */
  async sendAndRecord({ to, body, conversationId }) {
    const result = await this.sendTextMessage(to, body);

    const message = await MessagesRepo.create({
      conversation_id: conversationId,
      sender: "bot",
      content: body,
      content_type: "text",
    });

    return { ...result, message };
  },
};
