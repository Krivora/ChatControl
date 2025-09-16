// src/services/conversations.service.js
import { ConversationsRepo } from '../repositories/conversations.repo.js';
import { parsePagination } from '../utils/pagination.js';
import { ApiError } from '../utils/ApiError.js';

export const ConversationsService = {
  async listByCustomer(req) {
    const { limit, offset, page, pageSize } = parsePagination(req);
    const { customerId } = req.params;

    const items = await ConversationsRepo.listByCustomer(customerId, { limit, offset });
    return { items, meta: { page, pageSize } };
  },

  async getWithMessages(req) {
    const { limit, offset } = parsePagination(req);
    const { id } = req.params;

    const result = await ConversationsRepo.getWithMessages(id, { limit, offset });
    if (!result) throw new ApiError(404, 'Conversación no encontrada');

    return result;
  }
};
