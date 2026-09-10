// src/services/messages.service.js
import { MessagesRepo } from '../repositories/messages.repo.js';

export const MessagesService = {
  /** @param {{ conversationId: string|number, content: string, contentType?: string }} input */
  async create({ conversationId, content, contentType = 'text' }) {
    return MessagesRepo.create({
      conversation_id: conversationId,
      sender: 'user',
      content,
      content_type: contentType,
    });
  },

  /** @param {{ conversationId: string|number }} input */
  async listByConversation({ conversationId }) {
    return MessagesRepo.listByConversation(conversationId);
  },
};
