import { pool } from "../config/db.js";
import { WhatsAppService } from "../services/whatsapp.service.js";

async function checkUnansweredConversations() {
  try {
    const { rows } = await pool.query(`
      SELECT c.id AS conversation_id,
             cu.whatsapp_id AS phone,
             m.sender,
             m.created_at
      FROM conversations c
      JOIN customers cu ON cu.id = c.customer_id
      JOIN LATERAL (
        SELECT sender, created_at
        FROM messages
        WHERE conversation_id = c.id
        ORDER BY created_at DESC
        LIMIT 1
      ) m ON TRUE
      WHERE c.status = 'active'
        AND (c.reminder_sent IS FALSE OR c.reminder_sent IS NULL)
        AND cu.whatsapp_id IS NOT NULL
    `);

    for (const conv of rows) {
      if (conv.sender !== "bot") continue;

      const lastBotTime = new Date(conv.created_at);
      const diffMinutes = (Date.now() - lastBotTime.getTime()) / 60000;

      if (diffMinutes < 23 * 60) continue;

      const reminderText = `
        🚗 Gracias por tu interés en nuestros vehículos.
        Para poder ofrecerte una mejor atención y opciones más acertadas,
        por favor respóndenos la encuesta pendiente 🙏
        ¡Queremos ayudarte a encontrar el auto ideal para ti! 💬
      `.trim();

      await WhatsAppService.sendTextMessage(conv.phone, reminderText);

      await pool.query(
        `INSERT INTO messages (conversation_id, sender, content, content_type, created_at)
         VALUES ($1, 'bot', $2, 'text', NOW())`,
        [conv.conversation_id, reminderText]
      );

      await pool.query(
        `UPDATE conversations SET reminder_sent = TRUE WHERE id = $1`,
        [conv.conversation_id]
      );
    }
  } catch {
    // silencioso a propósito
  }
}

// Ejecutar cada minuto (silencioso)
setInterval(checkUnansweredConversations, 60 * 1000);
