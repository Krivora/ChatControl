// src/repositories/conversations.repo.js
import { pool } from "../config/db.js";

export const ConversationsRepo = {
  // Lista de conversaciones con último mensaje y sus respuestas
  async listWithLastMessage({ limit = 20, offset = 0 }) {
    const query = `
      SELECT c.id,
             c.status,
             cu.full_name AS customer_name,
             (
                SELECT m.content
                FROM messages m
                WHERE m.conversation_id = c.id
                ORDER BY m.created_at DESC
                LIMIT 1
             ) AS last_message,
             (
                SELECT m.created_at
                FROM messages m
                WHERE m.conversation_id = c.id
                ORDER BY m.created_at DESC
                LIMIT 1
             ) AS last_message_time,
             COALESCE(
               json_agg(
                 json_build_object('question_key', a.question_key, 'answer_value', a.answer_value)
               ) FILTER (WHERE a.id IS NOT NULL),
               '[]'
             ) AS answers
      FROM conversations c
      LEFT JOIN customers cu ON cu.id = c.customer_id
      LEFT JOIN answers a ON a.conversation_id = c.id
      GROUP BY c.id, cu.full_name
      ORDER BY last_message_time DESC NULLS LAST
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);
    // conv.answers viene como string JSON, así que parseamos
    return result.rows.map(r => ({
      ...r,
      answers: Array.isArray(r.answers) ? r.answers : JSON.parse(r.answers),
    }));
  },

  async count() {
    const result = await pool.query("SELECT COUNT(*) FROM conversations");
    return parseInt(result.rows[0].count, 10);
  },

  // Detalle completo de una conversación
  async getFullById(conversationId) {
    // Mensajes
    const messagesRes = await pool.query(
      `SELECT id, sender, content, content_type, created_at
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conversationId]
    );

    // Respuestas
    const answersRes = await pool.query(
      `SELECT id, question_key, answer_value, created_at
       FROM answers
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conversationId]
    );

    // Traer customer real desde la tabla customers
    const customerRes = await pool.query(
      `SELECT id, full_name, whatsapp_id
       FROM customers
       WHERE id = (SELECT customer_id FROM conversations WHERE id=$1)`,
      [conversationId]
    );

    const customer = customerRes.rows[0] || null;

    // Ponderación básica (opcional)
    const score = Math.min(100, answersRes.rowCount * 20);
    const ponderacion = {
      score,
      respuestas: answersRes.rows.map((a) => ({
        pregunta: a.question_key,
        valor: a.answer_value,
      })),
    };

    return {
      customer,
      conversation: {
        id: conversationId,
        status: (await pool.query(`SELECT status FROM conversations WHERE id=$1`, [conversationId])).rows[0]?.status ?? null,
      },
      messages: messagesRes.rows,
      answers: answersRes.rows,
      ponderacion,
    };
  },
};
