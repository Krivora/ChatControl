import { pool } from "../config/db.js";

export const AssignmentsRepo = {
  // Listar todas las asignaciones activas con nombre del cliente
  async listAll() {
    const { rows } = await pool.query(`
      SELECT
        a.id,
        a.conversation_id,
        a.user_id,
        a.status,
        a.status_assignment,   
        a.assigned_at,
        cu.full_name AS customer_name
      FROM assignments a
      LEFT JOIN conversations c ON c.id = a.conversation_id
      LEFT JOIN customers cu ON cu.id = c.customer_id
      WHERE a.status = 'active'
      ORDER BY a.assigned_at DESC
    `);
    return rows;
  },

  // Listar asignaciones por conversación
  async listByConversation(conversationId) {
    const { rows } = await pool.query(`
      SELECT
        a.id,
        a.conversation_id,
        a.user_id,
        a.status,
        a.status_assignment,   
        a.assigned_at,
        cu.full_name AS customer_name
      FROM assignments a
      LEFT JOIN conversations c ON c.id = a.conversation_id
      LEFT JOIN customers cu ON cu.id = c.customer_id
      WHERE a.conversation_id = $1
    `, [conversationId]);
    return rows;
  },

  // Crear una nueva asignación
  async create({ conversation_id, user_id }) {

    // Validar duplicados
    const { rows: existing } = await pool.query(
      `SELECT id FROM assignments WHERE conversation_id = $1 AND user_id = $2`,
      [conversation_id, user_id]
    );

    if (existing.length > 0) {
      throw new Error("DUPLICATE_ASSIGNMENT");
    }

    const { rows } = await pool.query(
      `INSERT INTO assignments (conversation_id, user_id, status, assigned_at)
       VALUES ($1, $2, 'active', NOW())
       RETURNING *`,
      [conversation_id, user_id]
    );

    return rows[0];
  },

  // Obtener asignación por ID
  async getById(id) {
    const { rows } = await pool.query(
      `SELECT * FROM assignments WHERE id = $1`,
      [id]
    );
    return rows[0];
  },

  // Actualizar asignación
  async update(id, { user_id, status, status_assignment }) {
    const { rows } = await pool.query(
      `UPDATE assignments
      SET user_id = COALESCE($1, user_id),
          status = COALESCE($2, status),
          status_assignment = COALESCE($3, status_assignment)
      WHERE id = $4
      RETURNING *`,
      [user_id, status, status_assignment, id]
    );
    return rows[0];
  },

  // Eliminar asignación
  async delete(id) {
    await pool.query(`DELETE FROM assignments WHERE id = $1`, [id]);
    return true;
  }
};
