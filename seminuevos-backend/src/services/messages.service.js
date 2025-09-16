// src/services/messages.service.js
import { MessagesRepo } from '../repositories/messages.repo.js';
import { parsePagination } from '../utils/pagination.js';

export const MessagesService = {
  async list(req) {
    const { limit, offset, page, pageSize } = parsePagination(req);
    const { conversationId } = req.params;

    const [items, total] = await Promise.all([
      MessagesRepo.listByConversation(conversationId, { limit, offset }),
      MessagesRepo.countByConversation(conversationId)
    ]);

    return { items, meta: { page, pageSize, total } };
  }
};
