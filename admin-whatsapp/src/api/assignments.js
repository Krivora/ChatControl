import { api } from "./client";

export const AssignmentsApi = {
  list: async () => {
    const token = localStorage.getItem("token"); // o donde guardes el JWT
    const res = await api.get("/assignments", {
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Cache-Control": "no-cache"
      },
    });
    return Array.isArray(res.data) ? res.data : res.data?.data || [];
  },

  listByConversation: async (conversationId) => {
    const token = localStorage.getItem("token");
    const res = await api.get(`/assignments/conversation/${conversationId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return Array.isArray(res.data) ? res.data : res.data?.data || [];
  },

  create: async ({ conversation_id, user_id, status }) => {
    const token = localStorage.getItem("token");
    const res = await api.post("/assignments", { conversation_id, user_id, status }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data?.data;
  },

  update: async (id, payload) => {
    const token = localStorage.getItem("token");
    const res = await api.put(`/assignments/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data?.data;
  },

  delete: async (id) => {
    const token = localStorage.getItem("token");
    const res = await api.delete(`/assignments/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data?.data;
  },
};
