// src/repositories/appointments.repo.js
import { pool } from '../config/db.js';

export const AppointmentsRepo = {
  async list({ dateFrom, dateTo, status, limit, offset }) {
    const params = [];
    const where = [];

    if (dateFrom) {
      params.push(dateFrom);
      where.push(`a.date >= $${params.length}`);
    }
    if (dateTo) {
      params.push(dateTo);
      where.push(`a.date <= $${params.length}`);
    }
    if (status) {
      params.push(status);
      where.push(`a.status = $${params.length}`);
    }

    params.push(limit, offset);

    const sql = `
      SELECT
        a.id,
        a.customer_id,
        a.advisor_id,
        a.date,
        a.time_start,
        a.time_end,
        a.status,
        a.created_at,
        c.full_name AS customer_name,
        c.whatsapp_id,
        u.nombre AS advisor_name,
        u.email   AS advisor_email
      FROM appointments a
      LEFT JOIN customers c ON c.id = a.customer_id
      LEFT JOIN users u ON u.id = a.advisor_id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY a.date ASC, a.time_start ASC
      LIMIT $${params.length - 1} OFFSET $${params.length};
    `;

    const { rows } = await pool.query(sql, params);
    return rows;
  },

  async count({ dateFrom, dateTo, status }) {
    const params = [];
    const where = [];

    if (dateFrom) {
      params.push(dateFrom);
      where.push(`date >= $${params.length}`);
    }
    if (dateTo) {
      params.push(dateTo);
      where.push(`date <= $${params.length}`);
    }
    if (status) {
      params.push(status);
      where.push(`status = $${params.length}`);
    }

    const sql = `SELECT COUNT(*)::int AS total FROM appointments ${where.length ? 'WHERE ' + where.join(' AND ') : ''}`;
    const { rows } = await pool.query(sql, params);
    return rows[0].total;
  },

  async getById(id) {
    const { rows } = await pool.query(`
      SELECT id, customer_id, advisor_id, date, time_start, time_end, status, created_at
      FROM appointments
      WHERE id = $1
    `, [id]);
    return rows[0] || null;
  },

  async create({ customer_id, advisor_id, date, time_start, time_end, status }) {
    const { rows } = await pool.query(`
      INSERT INTO appointments (customer_id, advisor_id, date, time_start, time_end, status)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
    `, [customer_id, advisor_id, date, time_start, time_end, status || 'pending']);
    return rows[0];
  },

  async update(id, { customer_id, advisor_id, date, time_start, time_end, status }) {
    const { rows } = await pool.query(`
      UPDATE appointments
      SET customer_id=$2,
          advisor_id=$3,
          date=$4,
          time_start=$5,
          time_end=$6,
          status=$7
      WHERE id=$1
      RETURNING *
    `, [id, customer_id, advisor_id, date, time_start, time_end, status]);
    return rows[0] || null;
  },

  async delete(id) {
    await pool.query(`DELETE FROM appointments WHERE id=$1`, [id]);
    return true;
  },

  // 🔹 NUEVO: obtener las fechas con citas
  async getDatesWithAppointments({ dateFrom, dateTo, status }) {
    const params = [];
    const where = [];

    if (dateFrom) {
      params.push(dateFrom);
      where.push(`date >= $${params.length}`);
    }
    if (dateTo) {
      params.push(dateTo);
      where.push(`date <= $${params.length}`);
    }
    if (status) {
      params.push(status);
      where.push(`status = $${params.length}`);
    }

    const sql = `
      SELECT date, COUNT(*)::int AS total
      FROM appointments
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      GROUP BY date
      ORDER BY date ASC
    `;

    const { rows } = await pool.query(sql, params);
    return rows; // [{ date: '2025-09-18', total: 1 }, ...]
  }
};
