import { pool } from "../config/db.js";

export const MessagesRepo = {
  async create({ conversation_id, sender, content, content_type = "text" }) {
    const query = `
      INSERT INTO messages (conversation_id, sender, content, content_type, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *;
    `;
    const values = [conversation_id, sender, content, content_type];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  // Nuevo método para listar mensajes por conversación
  async listByConversation(conversationId) {
    const query = `
      SELECT *
      FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC;
    `;
    const { rows } = await pool.query(query, [conversationId]);
    return rows;
  },
};
