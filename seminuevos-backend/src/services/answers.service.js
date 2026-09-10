// src/services/answers.service.js
import { AnswersRepo } from '../repositories/answers.repo.js';
import { ApiError } from '../utils/ApiError.js';

export const AnswersService = {
  /** @param {{ conversationId: string|number }} input */
  async list({ conversationId }) {
    const [items, total] = await Promise.all([
      AnswersRepo.listByConversation(conversationId),
      AnswersRepo.countByConversation(conversationId),
    ]);
    return { items, meta: { total } };
  },

  /** @param {{ conversationId: string|number, key: string }} input */
  async get({ conversationId, key }) {
    const answer = await AnswersRepo.getByKey(conversationId, key);
    if (!answer) throw new ApiError(404, 'Respuesta no encontrada');
    return answer;
  },
};
