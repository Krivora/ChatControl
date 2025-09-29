import { api } from "./client";

export const AssignmentsApi = {
  // Listar todas las asignaciones
  list: async () => {
    const res = await api.get("/assignments", {
      headers: { "Cache-Control": "no-cache" },
    });
    console.log("📌 API res.data:", res.data); // debug
    // Devuelve el array directamente si ya es un array
    return Array.isArray(res.data) ? res.data : res.data?.data || [];
  },

  // Listar asignaciones por conversación
  listByConversation: async (conversationId) => {
    const res = await api.get(`/assignments/conversation/${conversationId}`);
    return Array.isArray(res.data) ? res.data : res.data?.data || [];
  },

  create: async ({ conversation_id, user_id, status }) => {
    const res = await api.post("/assignments", { conversation_id, user_id, status });
    return res.data?.data;
  },

  update: async (id, payload) => {
    const res = await api.put(`/assignments/${id}`, payload);
    return res.data?.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/assignments/${id}`);
    return res.data?.data;
  },
};
