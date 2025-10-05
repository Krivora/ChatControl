// src/api/messages.js
import { api } from "./client";

export const MessagesApi = {
  list: () => api.get("/messages"),
  create: (data) => api.post("/messages", data),
  listByConversation: (conversationId) =>
    api.get(`/messages?conversation_id=${conversationId}`),
};
