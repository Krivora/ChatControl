// src/services/assignments.service.js
import { AssignmentsRepo } from '../repositories/assignments.repo.js';
import { ApiError } from '../utils/ApiError.js';

export const AssignmentsService = {
  async list(req) {
    const { conversationId } = req.params;
    return AssignmentsRepo.listByConversation(conversationId);
  },

  async get(req) {
    const { id } = req.params;
    const assignment = await AssignmentsRepo.getById(id);
    if (!assignment) throw new ApiError(404, 'Asignación no encontrada');
    return assignment;
  },

  async create(req) {
    return AssignmentsRepo.create(req.body);
  },

  async update(req) {
    const { id } = req.params;
    const updated = await AssignmentsRepo.update(id, req.body);
    if (!updated) throw new ApiError(404, 'Asignación no encontrada');
    return updated;
  },

  async remove(req) {
    const { id } = req.params;
    await AssignmentsRepo.delete(id);
    return { success: true };
  }
};
