import { api } from "./client";

export const AssignmentsApi = {
  // 🔹 Listar todas las asignaciones
  list: async () => {
    const res = await api.get("/assignments");
    return res.data?.data || [];
  },

  // 🔹 Listar asignaciones por conversación
  listByConversation: async (conversationId) => {
    const res = await api.get(`/assignments/conversation/${conversationId}`);
    return res.data?.data || [];
  },

  // 🔹 Crear asignación
  create: async ({ conversation_id, user_id, status }) => {
    const res = await api.post("/assignments", { conversation_id, user_id, status });
    return res.data?.data;
  },

  // 🔹 Actualizar asignación
  update: async (id, payload) => {
    const res = await api.put(`/assignments/${id}`, payload);
    return res.data?.data;
  },

  // 🔹 Eliminar asignación
  delete: async (id) => {
    const res = await api.delete(`/assignments/${id}`);
    return res.data?.data;
  },
};
