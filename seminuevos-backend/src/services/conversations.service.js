// src/services/conversations.service.js
import { ConversationsRepo } from '../repositories/conversations.repo.js';

export const ConversationsService = {
  /** @param {{ limit: number, offset: number, page: number, pageSize: number }} input */
  async list({ limit, offset, page, pageSize }) {
    const [items, total] = await Promise.all([
      ConversationsRepo.listWithLastMessage({ limit, offset }),
      ConversationsRepo.count(),
    ]);

    return { items, meta: { page, pageSize, total } };
  },

  /** @param {{ id: string|number }} input */
  async getFull({ id }) {
    return ConversationsRepo.getFullById(id);
  },
};
