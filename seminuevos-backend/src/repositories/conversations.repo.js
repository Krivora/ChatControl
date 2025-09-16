// src/repositories/conversations.repo.js
import { pool } from '../config/db.js';

export const ConversationsRepo = {
  async listByCustomer(customerId, { limit, offset }) {
    // Ordenamos por la última actividad de la conversación:
    // si tiene ended_at usamos ese; si no, started_at
    const { rows } = await pool.query(`
      SELECT
        v.id,
        v.customer_id,
        v.status,
        v.current_step,
        v.started_at,
        v.ended_at
      FROM conversations v
      WHERE v.customer_id = $1
      ORDER BY COALESCE(v.ended_at, v.started_at) DESC
      LIMIT $2 OFFSET $3
    `, [customerId, limit, offset]);
    return rows;
  },

  async getById(conversationId) {
    const { rows } = await pool.query(`
      SELECT
        id,
        customer_id,
        status,
        current_step,
        started_at,
        ended_at
      FROM conversations
      WHERE id = $1
    `, [conversationId]);
    return rows[0] || null;
  },

  async getWithMessages(conversationId, { limit, offset }) {
    const client = await pool.connect();
    try {
      const conv = await client.query(`
        SELECT
          id,
          customer_id,
          status,
          current_step,
          started_at,
          ended_at
        FROM conversations
        WHERE id = $1
      `, [conversationId]);

      if (!conv.rows[0]) return null;

      // OJO: aquí asumo que tu tabla messages tiene columna created_at.
      // Si en tu schema se llama distinto (p.ej. sent_at), cambia "created_at" por el nombre correcto.
      const msgs = await client.query(`
        SELECT
          id,
          conversation_id,
          sender,
          content,
          created_at
        FROM messages
        WHERE conversation_id = $1
        ORDER BY created_at ASC
        LIMIT $2 OFFSET $3
      `, [conversationId, limit, offset]);

      return { conversation: conv.rows[0], messages: msgs.rows };
    } finally {
      client.release();
    }
  }
};
