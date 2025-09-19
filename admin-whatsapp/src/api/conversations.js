import { api } from "./client";

export const getConversations = async () => {
  const res = await api.get("/conversations");
  return res.data || [];
};

export const getConversationDetail = async (id) => {
  const res = await api.get(`/conversations/${id}/full`);
  return res.data;
};
