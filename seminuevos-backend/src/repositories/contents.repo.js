import { pool } from "../config/db.js";

export const ContentsRepo = {
  async list() {
    const query = `
      SELECT *
      FROM contents
      ORDER BY id ASC;
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  async getById(id) {
    const query = `
      SELECT *
      FROM contents
      WHERE id = $1;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  async update(id, { name, type, content }) {
    const query = `
      UPDATE contents
      SET name = $1, type = $2, content = $3
      WHERE id = $4
      RETURNING *;
    `;
    const values = [name, type, content, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

};
