// src/repositories/conversations.repo.js
import { pool } from "../config/db.js";

export const ConversationsRepo = {
  // 🔹 Lista de conversaciones con último mensaje
  async listWithLastMessage({ limit = 20, offset = 0 }) {
    const query = `
      SELECT c.id,
             c.customer_id,
             cu.full_name AS customer_name,
             cu.whatsapp_id,
             cu.created_at,
             cu.last_interaction,
             c.status,
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
             ) AS last_message_time
      FROM conversations c
      JOIN customers cu ON cu.id = c.customer_id
      ORDER BY last_message_time DESC NULLS LAST
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  },

  async count() {
    const result = await pool.query("SELECT COUNT(*) FROM conversations");
    return parseInt(result.rows[0].count, 10);
  },

  // 🔹 Detalle completo de una conversación
  async getFullById(id) {
    const convRes = await pool.query(
      `SELECT c.id AS conversation_id, c.customer_id, c.status, c.current_step, 
              c.started_at, c.ended_at,
              cu.full_name, cu.whatsapp_id, cu.created_at, cu.last_interaction
       FROM conversations c
       JOIN customers cu ON cu.id = c.customer_id
       WHERE c.id = $1`,
      [id]
    );

    if (convRes.rowCount === 0) return null;
    const conversation = convRes.rows[0];

    // mensajes
    const messagesRes = await pool.query(
      `SELECT id, sender, content, content_type, created_at
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [id]
    );

    // respuestas
    const answersRes = await pool.query(
      `SELECT id, question_key, answer_value, created_at
       FROM answers
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [id]
    );

    // ponderación básica
    const score = Math.min(100, answersRes.rowCount * 20);
    const ponderacion = {
      score,
      respuestas: answersRes.rows.map((a) => ({
        pregunta: a.question_key,
        valor: a.answer_value,
      })),
    };

    return {
      customer: {
        id: conversation.customer_id,
        nombre: conversation.full_name,
        whatsapp_id: conversation.whatsapp_id,
        created_at: conversation.created_at,
        lastInteraction: conversation.last_interaction,
      },
      conversation: {
        id: conversation.conversation_id,
        status: conversation.status,
        current_step: conversation.current_step,
        started_at: conversation.started_at,
        ended_at: conversation.ended_at,
      },
      messages: messagesRes.rows,
      answers: answersRes.rows,
      ponderacion,
    };
  },
};
