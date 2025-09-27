// src/api/messages.js
import { api } from "./client";

export const MessagesApi = {
  create: (data) => api.post("/messages", data),
  listByConversation: (conversationId) =>
    api.get(`/messages?conversation_id=${conversationId}`),
};
