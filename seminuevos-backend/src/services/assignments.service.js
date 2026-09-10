// src/services/assignments.service.js
import { AssignmentsRepo } from '../repositories/assignments.repo.js';
import { ApiError } from '../utils/ApiError.js';

export const AssignmentsService = {
  /** @param {{ conversationId: string|number }} input */
  async list({ conversationId }) {
    return AssignmentsRepo.listByConversation(conversationId);
  },

  /** @param {{ id: string|number }} input */
  async get({ id }) {
    const assignment = await AssignmentsRepo.getById(id);
    if (!assignment) throw new ApiError(404, 'Asignación no encontrada');
    return assignment;
  },

  /** @param {{ conversation_id, user_id, status }} data */
  async create(data) {
    try {
      return await AssignmentsRepo.create(data);
    } catch (err) {
      // El repositorio señala el conflicto con un código propio: no conoce
      // HTTP. La traducción a un 409 es responsabilidad de esta capa.
      if (err.message === 'DUPLICATE_ASSIGNMENT') {
        throw new ApiError(409, 'Este usuario ya está asignado a la conversación');
      }
      if (err.message === 'ALREADY_ASSIGNED') {
        throw new ApiError(409, 'Esta conversación ya tiene un asesor asignado');
      }
      throw err;
    }
  },

  /** @param {{ id: string|number, data: object }} input */
  async update({ id, data }) {
    const updated = await AssignmentsRepo.update(id, data);
    if (!updated) throw new ApiError(404, 'Asignación no encontrada');
    return updated;
  },

  /** @param {{ id: string|number }} input */
  async remove({ id }) {
    await AssignmentsRepo.delete(id);
    return { success: true };
  },

  /**
   * Un asesor sólo ve sus propias asignaciones; administración las ve todas.
   *
   * `actor` es el usuario autenticado ya extraído del token: el service decide
   * el alcance según el rol sin saber de dónde vino la identidad.
   *
   * @param {{ actor: { id: number, role: string } }} input
   */
  async listAll({ actor }) {
    const role = String(actor?.role || '').toLowerCase();
    if (role === 'usuario') return AssignmentsRepo.listByUser(actor.id);
    return AssignmentsRepo.listAll();
  },
};
