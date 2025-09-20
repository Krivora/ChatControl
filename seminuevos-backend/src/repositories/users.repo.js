// src/repositories/users.repo.js
import { pool } from '../config/db.js';

export const UsersRepo = {
  async list({ limit, offset }) {
    const { rows } = await pool.query(`
      SELECT
        id, nombre, apellido, email, telefono,
        fecha_nacimiento, genero, dark_mode,
        created_at, updated_at
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    return rows;
  },

  async count() {
    const { rows } = await pool.query(`SELECT COUNT(*)::int AS total FROM users`);
    return rows[0].total;
  },

  async getById(id) {
    const { rows } = await pool.query(`
      SELECT
        id, nombre, apellido, email, telefono,
        fecha_nacimiento, genero, dark_mode,
        created_at, updated_at
      FROM users
      WHERE id = $1
    `, [id]);
    return rows[0] || null;
  },

  async getByEmail(email) {
    const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    return rows[0] || null;
  },

  async create({ nombre, apellido, email, telefono, fecha_nacimiento, genero, passwordHash }) {
    const { rows } = await pool.query(`
      INSERT INTO users (nombre, apellido, email, telefono, fecha_nacimiento, genero, password)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING id, nombre, apellido, email, telefono, fecha_nacimiento, genero, dark_mode, created_at
    `, [nombre, apellido, email, telefono, fecha_nacimiento, genero, passwordHash]);
    return rows[0];
  },

  async updateDarkMode(userId, darkMode) {
    const { rows } = await pool.query(
      `UPDATE users 
       SET dark_mode = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, dark_mode`,
      [darkMode, userId]
    );
    return rows[0];
  },

  async update(id, { nombre, apellido, email, telefono, fecha_nacimiento, genero, passwordHash }) {
    const { rows } = await pool.query(`
      UPDATE users
      SET nombre=$1, apellido=$2, email=$3, telefono=$4,
          fecha_nacimiento=$5, genero=$6, password=$7,
          updated_at=NOW()
      WHERE id=$8
      RETURNING id, nombre, apellido, email, telefono, fecha_nacimiento, genero, dark_mode, created_at
    `, [nombre, apellido, email, telefono, fecha_nacimiento, genero, passwordHash, id]);

    return rows[0];
  }

};
