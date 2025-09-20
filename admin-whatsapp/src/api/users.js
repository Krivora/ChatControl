import { api } from "./client";

export const UsersApi = {
  list: async (params = {}) => {
    const { data } = await api.get("/users", { params });
    return data;
  },

  get: async (id) => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  create: async (payload) => {
    const { data } = await api.post("/users", payload);
    return data;
  },

  update: async (id, payload) => {
    const { data } = await api.put(`/users/${id}`, payload);
    return data;
  },

  remove: async (id) => {
    const res = await api.del(`/users/${id}`);
    return res.data; 
  },


  // dark mode
  updateDarkMode: async (darkMode) => {
    const { data } = await api.patch("/users/dark-mode", { darkMode });
    return data;
  }
};
