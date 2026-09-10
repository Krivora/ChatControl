import { pool } from '../config/db.js';

export const UsersRepo = {
  async list({ limit, offset }) {
    const { rows } = await pool.query(`
      SELECT
        u.id, u.nombre, u.apellido, u.email, u.telefono,
        u.fecha_nacimiento, u.genero, u.dark_mode,
        u.role_id,
        r.name AS role_name,
        u.created_at, u.updated_at
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.deleted_at IS NULL
      ORDER BY u.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    return rows;
  },

  async count() {
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS total FROM users WHERE deleted_at IS NULL`
    );
    return rows[0].total;
  },

  async getById(id) {
    const { rows } = await pool.query(`
      SELECT
        u.id, u.nombre, u.apellido, u.email, u.telefono,
        u.fecha_nacimiento, u.genero, u.dark_mode,
        u.role_id,
        r.name AS role_name,
        u.created_at, u.updated_at
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1 AND u.deleted_at IS NULL
    `, [id]);
    return rows[0] || null;
  },

  async getByEmail(email) {
    const { rows } = await pool.query(`
      SELECT 
        u.*, 
        r.name AS role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.email = $1 AND u.deleted_at IS NULL
    `, [email]);
    return rows[0] || null;
  },

  async create({ nombre, apellido, email, telefono, fecha_nacimiento, genero, passwordHash, role_id }) {
    const { rows } = await pool.query(`
      INSERT INTO users (
        nombre, apellido, email, telefono, fecha_nacimiento, genero, password, role_id
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING 
        id, nombre, apellido, email, telefono, fecha_nacimiento, genero, dark_mode, role_id, created_at
    `, [nombre, apellido, email, telefono, fecha_nacimiento, genero, passwordHash, role_id]);
    return rows[0];
  },

  async update(id, { nombre, apellido, email, telefono, fecha_nacimiento, genero, passwordHash, role_id }) {
    const values = [nombre, apellido, email, telefono, fecha_nacimiento, genero];
    let set = `
      nombre=$1, 
      apellido=$2, 
      email=$3, 
      telefono=$4, 
      fecha_nacimiento=$5, 
      genero=$6
    `;

    if (passwordHash) {
      values.push(passwordHash);
      set += `, password=$${values.length}`;
    }

    if (role_id) {
      values.push(role_id);
      set += `, role_id=$${values.length}`;
    }

    values.push(id);

    const query = `
      UPDATE users
      SET ${set}, updated_at=NOW()
      WHERE id=$${values.length} AND deleted_at IS NULL
      RETURNING 
        id, nombre, apellido, email, telefono, fecha_nacimiento, genero, dark_mode, role_id, updated_at;
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
