// src/repositories/messages.repo.js
import { pool } from '../config/db.js';

export const MessagesRepo = {
  async listByConversation(conversationId, { limit, offset }) {
    const { rows } = await pool.query(`
      SELECT
        id,
        conversation_id,
        sender,
        content,
        content_type,
        created_at
      FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
      LIMIT $2 OFFSET $3
    `, [conversationId, limit, offset]);

    return rows;
  },

  async countByConversation(conversationId) {
    const { rows } = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM messages
      WHERE conversation_id = $1
    `, [conversationId]);
    return rows[0].total;
  }
};
