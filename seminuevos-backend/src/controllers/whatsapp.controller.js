import { asyncHandler } from "../utils/asyncHandler.js";
import { WhatsAppService } from "../services/whatsapp.service.js";
import { ok } from "../utils/ApiResponse.js";
import { pool } from "../config/db.js";

// 📩 Enviar mensaje manualmente
export const sendMessage = asyncHandler(async (req, res) => {
  const { to, body, conversation_id } = req.body;

  if (!to || !body || !conversation_id) {
    return res
      .status(400)
      .json({ message: "Faltan campos: 'to', 'body' y 'conversation_id'" });
  }

  const result = await WhatsAppService.sendTextMessage(to, body);

  // 🧾 Registrar el mensaje del bot en la base de datos
  await pool.query(
    `
    INSERT INTO messages (conversation_id, sender, content, content_type, created_at)
    VALUES ($1, 'bot', $2, 'text', NOW())
  `,
    [conversation_id, body]
  );

  return ok(res, result);
});
