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
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    return rows;
  },

  

  async getById(id) {
    const { rows } = await pool.query(`
      SELECT
        id, nombre, apellido, email, telefono,
        fecha_nacimiento, genero, dark_mode,
        created_at, updated_at
      FROM users
      WHERE id = $1 AND deleted_at IS NULL
    `, [id]);
    return rows[0] || null;
  },

  async getByEmail(email) {
    const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL`, [email]);
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

  async update(id, { nombre, apellido, email, telefono, fecha_nacimiento, genero, passwordHash }) {
    // valores obligatorios
    const values = [nombre, apellido, email, telefono, fecha_nacimiento, genero];
    let set = `
      nombre=$1, 
      apellido=$2, 
      email=$3, 
      telefono=$4, 
      fecha_nacimiento=$5, 
      genero=$6
    `;

    // si hay password, lo agregamos
    if (passwordHash) {
      values.push(passwordHash);
      set += `, password=$${values.length}`;
    }

    // id al final
    values.push(id);

    const query = `
      UPDATE users
      SET ${set}, updated_at=NOW()
      WHERE id=$${values.length}
      RETURNING id, nombre, apellido, email, telefono, fecha_nacimiento, genero, dark_mode, created_at;
    `;

    const { rows } = await pool.query(query, values);
    return rows[0];
  },


  async softDelete(id) {
    const { rows } = await pool.query(`
      UPDATE users
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1
      RETURNING id
    `, [id]);
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
};
