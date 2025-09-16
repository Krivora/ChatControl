// src/repositories/customers.repo.js
import { pool } from '../config/db.js';

export const CustomersRepo = {
  // Lista de clientes con último mensaje (si existe)
  async list({ q, limit, offset }) {
    const params = [];
    let where = '';
    if (q) {
      params.push(`%${q}%`, `%${q}%`);
      where = `WHERE c.full_name ILIKE $${params.length - 1} OR c.whatsapp_id ILIKE $${params.length}`;
    }
    params.push(limit, offset);

    const sql = `
      SELECT c.id, c.whatsapp_id, c.full_name, c.created_at, c.last_interaction,
             COALESCE(m.last_message, '') AS last_message,
             COALESCE(m.last_at, c.last_interaction) AS last_at
      FROM customers c
      LEFT JOIN LATERAL (
        SELECT msg.content AS last_message, msg.created_at AS last_at
        FROM conversations v
        JOIN messages msg ON msg.conversation_id = v.id
        WHERE v.customer_id = c.id
        ORDER BY msg.created_at DESC
        LIMIT 1
      ) m ON true
      ${where}
      ORDER BY last_at DESC NULLS LAST
      LIMIT $${params.length - 1} OFFSET $${params.length};
    `;

    const { rows } = await pool.query(sql, params);
    return rows;
  },

  async count({ q }) {
    const params = [];
    let where = '';
    if (q) {
      params.push(`%${q}%`, `%${q}%`);
      where = `WHERE full_name ILIKE $1 OR whatsapp_id ILIKE $2`;
    }
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS total FROM customers ${where}`,
      params
    );
    return rows[0].total;
  },

  async getById(id) {
    const { rows } = await pool.query(
      `SELECT id, whatsapp_id, full_name, created_at, last_interaction
       FROM customers
       WHERE id=$1`,
      [id]
    );
    return rows[0] || null;
  }
};
