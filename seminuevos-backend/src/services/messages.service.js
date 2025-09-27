import { MessagesRepo } from "../repositories/messages.repo.js";

export const MessagesService = {
  async create(req) {
    const { conversation_id, content, content_type } = req.body;
    return await MessagesRepo.create({
      conversation_id,
      sender: "user",
      content,
      content_type: content_type || "text",
    });
  },

  // Nuevo método para obtener mensajes por conversación
  async listByConversation(conversationId) {
    return await MessagesRepo.listByConversation(conversationId);
  },
};
