// src/repositories/slots.repo.js
import { pool } from '../config/db.js';

export const SlotsRepo = {
  // Traer slots base (sin generar intervalos, solo la tabla cruda)
  async list({ weekday = null, active = null }) {
    const params = [];
    const where = [];

    if (weekday !== null) {
      params.push(weekday);
      where.push(`weekday = $${params.length}`);
    }
    if (active !== null) {
      params.push(active);
      where.push(`active = $${params.length}`);
    }

    const sql = `
      SELECT id, weekday, time_start, time_end, active
      FROM available_slots
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY weekday ASC, time_start ASC
    `;
    const { rows } = await pool.query(sql, params);
    return rows;
  },

  // Generar intervalos de 30 min para una fecha (YYYY-MM-DD) y excluir ocupados
  async availableForDate(dateISO) {
    const { rows } = await pool.query(`
      WITH base_slots AS (
        SELECT time_start, time_end
        FROM available_slots
        WHERE weekday = EXTRACT(ISODOW FROM $1::date)  -- domingo=0, lunes=1, etc.
          AND active = true
      ),
      intervals AS (
        SELECT
          gs AS slot_start,
          gs + interval '30 minutes' AS slot_end
        FROM base_slots b,
        LATERAL generate_series(
          ($1::date + b.time_start)::timestamp,
          ($1::date + b.time_end)::timestamp - interval '30 minutes',
          interval '30 minutes'
        ) gs
      ),
      occupied AS (
        SELECT ($1::date + time_start)::timestamp AS time_start,
               ($1::date + time_end)::timestamp   AS time_end
        FROM appointments
        WHERE date = $1::date
          AND status IN ('pending','confirmed')
      )
      SELECT slot_start::time AS time
      FROM intervals i
      WHERE NOT EXISTS (
        SELECT 1 FROM occupied o
        WHERE i.slot_start < o.time_end
          AND i.slot_end   > o.time_start
      )
      ORDER BY time;
    `, [dateISO]);
    return rows.map(r => r.time);
  }
};
