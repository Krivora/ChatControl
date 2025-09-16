// src/repositories/answers.repo.js
import { pool } from '../config/db.js';

export const AnswersRepo = {
  async listByConversation(conversationId) {
    const { rows } = await pool.query(`
      SELECT
        id,
        conversation_id,
        question_key,
        answer_value,
        created_at
      FROM answers
      WHERE conversation_id = $1
      ORDER BY created_at ASC
    `, [conversationId]);
    return rows;
  },

  async getByKey(conversationId, key) {
    const { rows } = await pool.query(`
      SELECT
        id,
        conversation_id,
        question_key,
        answer_value,
        created_at
      FROM answers
      WHERE conversation_id = $1
        AND question_key = $2
      LIMIT 1
    `, [conversationId, key]);
    return rows[0] || null;
  },

  async countByConversation(conversationId) {
    const { rows } = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM answers
      WHERE conversation_id = $1
    `, [conversationId]);
    return rows[0].total;
  }
};
