import { api } from "./client";

// `api` ya adjunta el token y devuelve el JSON parseado ({ ok, data, meta }),
// así que aquí no se pasan cabeceras ni se accede a `res.data.data`: ese
// doble salto venía de tratar al cliente como si fuera axios y hacía que
// create/update/delete devolvieran siempre undefined.
const unwrapList = (res) => (Array.isArray(res?.data) ? res.data : []);

export const AssignmentsApi = {
  list: async () => unwrapList(await api.get("/assignments")),

  listByConversation: async (conversationId) =>
    unwrapList(await api.get(`/assignments/conversation/${conversationId}`)),

  create: async ({ conversation_id, user_id, status }) => {
    const res = await api.post("/assignments", { conversation_id, user_id, status });
    return res?.data;
  },

  update: async (id, payload) => {
    const res = await api.put(`/assignments/${id}`, payload);
    return res?.data;
  },

  delete: async (id) => {
    const res = await api.del(`/assignments/${id}`);
    return res?.data;
  },
};
