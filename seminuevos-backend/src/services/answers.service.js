// src/services/answers.service.js
import { AnswersRepo } from '../repositories/answers.repo.js';
import { ApiError } from '../utils/ApiError.js';

export const AnswersService = {
  async list(req) {
    const { conversationId } = req.params;
    const items = await AnswersRepo.listByConversation(conversationId);
    const total = await AnswersRepo.countByConversation(conversationId);
    return { items, meta: { total } };
  },

  async get(req) {
    const { conversationId, key } = req.params;
    const answer = await AnswersRepo.getByKey(conversationId, key);
    if (!answer) throw new ApiError(404, 'Respuesta no encontrada');
    return answer;
  }
};
