import { pool } from "../config/db.js";

export const AssignmentsRepo = {
  // Listar todas las asignaciones activas con nombre del cliente
  async listAll() {
    console.log("📌 AssignmentsRepo.listAll: ejecutando query");
    const { rows } = await pool.query(`
      SELECT
        a.id,
        a.conversation_id,
        a.user_id,
        a.status,
        a.assigned_at,
        cu.full_name AS customer_name
      FROM assignments a
      LEFT JOIN conversations c ON c.id = a.conversation_id
      LEFT JOIN customers cu ON cu.id = c.customer_id
      WHERE a.status = 'active'
      ORDER BY a.assigned_at DESC
    `);
    console.log("📌 AssignmentsRepo.listAll: filas obtenidas", rows);
    return rows;
  },

  // Listar asignaciones por conversación
  async listByConversation(conversationId) {
    console.log("📌 AssignmentsRepo.listByConversation: ejecutando query", conversationId);
    const { rows } = await pool.query(`
      SELECT
        a.id,
        a.conversation_id,
        a.user_id,
        a.status,
        a.assigned_at,
        cu.full_name AS customer_name
      FROM assignments a
      LEFT JOIN conversations c ON c.id = a.conversation_id
      LEFT JOIN customers cu ON cu.id = c.customer_id
      WHERE a.conversation_id = $1
    `, [conversationId]);

    console.log("📌 AssignmentsRepo.listByConversation: filas obtenidas", rows);
    return rows;
  },

  // Crear una nueva asignación
  async create({ conversation_id, user_id }) {
    console.log("📌 AssignmentsRepo.create: creando asignación", conversation_id, user_id);

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

    console.log("📌 AssignmentsRepo.create: asignación creada", rows[0]);
    return rows[0];
  },

  // Obtener asignación por ID
  async getById(id) {
    console.log("📌 AssignmentsRepo.getById: buscando asignación", id);
    const { rows } = await pool.query(
      `SELECT * FROM assignments WHERE id = $1`,
      [id]
    );
    return rows[0];
  },

  // Actualizar asignación
  async update(id, { user_id, status }) {
    console.log("📌 AssignmentsRepo.update: actualizando asignación", id);
    const { rows } = await pool.query(
      `UPDATE assignments
       SET user_id = COALESCE($1, user_id),
           status = COALESCE($2, status)
       WHERE id = $3
       RETURNING *`,
      [user_id, status, id]
    );
    return rows[0];
  },

  // Eliminar asignación
  async delete(id) {
    console.log("📌 AssignmentsRepo.delete: eliminando asignación", id);
    await pool.query(`DELETE FROM assignments WHERE id = $1`, [id]);
    return true;
  }
};
