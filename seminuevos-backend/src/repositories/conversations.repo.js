// src/repositories/conversations.repo.js
import { pool } from "../config/db.js";

export const ConversationsRepo = {
  // 🔹 Lista de conversaciones con último mensaje
  async listWithLastMessage({ limit = 20, offset = 0 }) {
    const query = `
      SELECT c.id,
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
  async getFullById(conversationId) {
    // mensajes
    const messagesRes = await pool.query(
      `SELECT id, sender, content, content_type, created_at
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conversationId]
    );

    // respuestas
    const answersRes = await pool.query(
      `SELECT id, question_key, answer_value, created_at
       FROM answers
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conversationId]
    );

    // mapear answers a objeto { key: value }
    const answersMap = {};
    answersRes.rows.forEach((a) => {
      answersMap[a.question_key] = a.answer_value;
    });

    // armar customer desde answers
    const customer = {
      nombre: answersMap["full_name"] || "Cliente",
      telefono: answersMap["telefono_question"] || null,
      email: answersMap["email_question"] || null,
    };

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
      customer,
      conversation: {
        id: conversationId,
      },
      messages: messagesRes.rows,
      answers: answersRes.rows,
      ponderacion,
    };
  },
};
