import { api } from "./client";

// ContentsApi
export const ContentsApi = {
  list: async (params = {}) => {
    return api.get("/contents", { params });
  },

  get: async (id) => {
    return api.get(`/contents/${id}`);
  },

  create: async (payload) => {
    return api.post("/contents", payload);
  },

  update: async (id, payload) => {
    return api.put(`/contents/${id}`, payload);
  },

  remove: async (id) => {
    return api.del(`/contents/${id}`);
  },
};
