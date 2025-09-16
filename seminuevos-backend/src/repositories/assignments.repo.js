// src/repositories/assignments.repo.js
import { pool } from '../config/db.js';

export const AssignmentsRepo = {
  async listByConversation(conversationId) {
    const { rows } = await pool.query(`
      SELECT
        a.id,
        a.conversation_id,
        a.user_id,
        a.status,
        a.assigned_at,
        u.nombre AS user_name,
        u.apellido AS user_lastname,
        u.email AS user_email
      FROM assignments a
      LEFT JOIN users u ON u.id = a.user_id
      WHERE a.conversation_id = $1
      ORDER BY a.assigned_at DESC
    `, [conversationId]);
    return rows;
  },

  async getById(id) {
    const { rows } = await pool.query(`
      SELECT
        id,
        conversation_id,
        user_id,
        status,
        assigned_at
      FROM assignments
      WHERE id = $1
    `, [id]);
    return rows[0] || null;
  },

  async create({ conversation_id, user_id, status }) {
    const { rows } = await pool.query(`
      INSERT INTO assignments (conversation_id, user_id, status, assigned_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `, [conversation_id, user_id, status || 'active']);
    return rows[0];
  },

  async update(id, { status, user_id }) {
    const { rows } = await pool.query(`
      UPDATE assignments
      SET status = COALESCE($2, status),
          user_id = COALESCE($3, user_id),
          assigned_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id, status, user_id]);
    return rows[0] || null;
  },

  async delete(id) {
    await pool.query(`DELETE FROM assignments WHERE id = $1`, [id]);
    return true;
  }
};
