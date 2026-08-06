import { pool } from "../config/db.js";

export const AssignmentsRepo = {
  // Listar todas las asignaciones activas con nombre del cliente
async listAll() {
  try {
    const { rows } = await pool.query(`
      SELECT
        a.id,
        a.conversation_id,
        a.user_id,
        u.nombre AS user_nombre,
        u.apellido AS user_apellido,
        a.status,
        a.status_assignment,
        a.assigned_at,
        cu.id AS customer_id,
        cu.full_name AS customer_name,
        cu.whatsapp_id,
        COALESCE(json_agg(
          json_build_object('id', ans.id, 'question_key', ans.question_key, 'answer_value', ans.answer_value)
        ) FILTER (WHERE ans.id IS NOT NULL), '[]') AS answers
      FROM assignments a
      LEFT JOIN conversations c ON c.id = a.conversation_id
      LEFT JOIN customers cu ON cu.id = c.customer_id
      LEFT JOIN answers ans ON ans.conversation_id = c.id
      LEFT JOIN users u ON u.id = a.user_id
      GROUP BY a.id, cu.id, cu.full_name, cu.whatsapp_id, u.id
      ORDER BY a.assigned_at DESC
    `);
    return rows;
  } catch (err) {
    console.error("Error en AssignmentsRepo.listAll:", err);
    throw new Error("Error al obtener asignaciones");
  }
},


  // Listar asignaciones por conversación con teléfono
  async listByConversation(conversationId) {
    const { rows } = await pool.query(`
      SELECT
        a.id,
        a.conversation_id,
        a.user_id,
        a.status,
        a.status_assignment,
        a.assigned_at,
        cu.full_name AS customer_name,
        cu.whatsapp_id
      FROM assignments a
      LEFT JOIN conversations c ON c.id = a.conversation_id
      LEFT JOIN customers cu ON cu.id = c.customer_id
      WHERE a.conversation_id = $1
    `, [conversationId]);
    return rows;
  },

  // Crear una nueva asignación
  async create({ conversation_id, user_id }) {

    // Una conversación solo puede tener un asesor activo a la vez.
    const { rows: existing } = await pool.query(
      `SELECT id, user_id FROM assignments
       WHERE conversation_id = $1 AND status = 'active'`,
      [conversation_id]
    );

    if (existing.length > 0) {
      throw new Error(
        existing.some(a => a.user_id === user_id)
          ? "DUPLICATE_ASSIGNMENT"
          : "ALREADY_ASSIGNED"
      );
    }

    const { rows } = await pool.query(
      `INSERT INTO assignments (conversation_id, user_id, status, status_assignment, assigned_at)
      VALUES ($1, $2, 'active', 'En proceso', NOW())
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
  },
   async listByUser(userId) {
    const { rows } = await pool.query(`
      SELECT
        a.id,
        a.conversation_id,
        a.user_id,
        u.nombre AS user_nombre,
        u.apellido AS user_apellido,
        a.status,
        a.status_assignment,
        a.assigned_at,
        cu.id AS customer_id,
        cu.full_name AS customer_name,
        cu.whatsapp_id,
        COALESCE(json_agg(
          json_build_object('id', ans.id, 'question_key', ans.question_key, 'answer_value', ans.answer_value)
        ) FILTER (WHERE ans.id IS NOT NULL), '[]') AS answers
      FROM assignments a
      LEFT JOIN conversations c ON c.id = a.conversation_id
      LEFT JOIN customers cu ON cu.id = c.customer_id
      LEFT JOIN answers ans ON ans.conversation_id = c.id
      LEFT JOIN users u ON u.id = a.user_id
      WHERE a.status = 'active' AND a.user_id = $1
      GROUP BY a.id, cu.id, cu.full_name, cu.whatsapp_id, u.id
      ORDER BY a.assigned_at DESC
    `, [userId]);
    return rows;
  }

};
