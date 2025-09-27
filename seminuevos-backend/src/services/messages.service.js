// src/services/messages.service.js
import { MessagesRepo } from "../repositories/messages.repo.js";

export const MessagesService = {
  async create(req) {
    const { conversation_id, content, content_type } = req.body;
    // aquí forzamos sender = 'user'
    return await MessagesRepo.create({
      conversation_id,
      sender: "user",
      content,
      content_type: content_type || "text",
    });
  },
};
