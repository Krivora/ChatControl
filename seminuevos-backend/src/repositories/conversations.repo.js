// src/repositories/conversations.repo.js
import { pool } from "../config/db.js";

export const ConversationsRepo = {
  // Lista de conversaciones con último mensaje, respuestas y SOLO sin asignar
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
      LEFT JOIN assignments asg
             ON asg.conversation_id = c.id
            AND asg.status = 'active'
      WHERE asg.id IS NULL -- 👈 SOLO sin asignar
      GROUP BY c.id, cu.full_name
      ORDER BY last_message_time DESC NULLS LAST
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);
    return result.rows.map(r => ({
      ...r,
      answers: Array.isArray(r.answers) ? r.answers : JSON.parse(r.answers),
    }));
  },

  async count() {
    // contar SOLO las sin asignar también
    const result = await pool.query(`
      SELECT COUNT(*) 
      FROM conversations c
      LEFT JOIN assignments asg
             ON asg.conversation_id = c.id
            AND asg.status = 'active'
      WHERE asg.id IS NULL
    `);
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

    // Customer
    const customerRes = await pool.query(
      `SELECT id, full_name, whatsapp_id
       FROM customers
       WHERE id = (SELECT customer_id FROM conversations WHERE id=$1)`,
      [conversationId]
    );

    const customer = customerRes.rows[0] || null;

    // Ponderación (ejemplo simple)
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
        status: (
          await pool.query(`SELECT status FROM conversations WHERE id=$1`, [
            conversationId,
          ])
        ).rows[0]?.status ?? null,
      },
      messages: messagesRes.rows,
      answers: answersRes.rows,
      ponderacion,
    };
  },
};

/**
 * Consultas que consume el job de seguimiento automático.
 *
 * Viven en la capa de repositorio (y no dentro del job) para que el SQL siga
 * concentrado en un solo lugar por agregado: el job orquesta, no habla con
 * la base directamente.
 */
export const FollowupRepo = {
  /**
   * Conversaciones activas cuyo último mensaje lo mandó el bot hace más de
   * `afterHours` horas y a las que todavía no se les envió el recordatorio.
   *
   * El filtro de antigüedad se resuelve en SQL: antes se traían todas las
   * conversaciones activas y se descartaban en memoria una por una.
   */
  async findPendingReminders({ afterHours }) {
    const query = `
      SELECT c.id       AS conversation_id,
             cu.whatsapp_id AS phone,
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
        AND COALESCE(c.reminder_sent, FALSE) = FALSE
        AND cu.whatsapp_id IS NOT NULL
        AND m.sender = 'bot'
        AND m.created_at < NOW() - ($1 || ' hours')::interval;
    `;
    const { rows } = await pool.query(query, [String(afterHours)]);
    return rows;
  },

  async markReminderSent(conversationId) {
    const { rowCount } = await pool.query(
      `UPDATE conversations SET reminder_sent = TRUE WHERE id = $1`,
      [conversationId]
    );
    return rowCount > 0;
  },
};
