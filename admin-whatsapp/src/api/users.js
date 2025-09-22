import { api } from "./client";

// UsersApi
export const UsersApi = {
  list: async (params = {}) => {
    return api.get("/users", { params }); // no destructures
  },
  get: async (id) => {
    return api.get(`/users/${id}`);
  },
  create: async (payload) => {
    return api.post("/users", payload);
  },
  update: async (id, payload) => {
    return api.put(`/users/${id}`, payload);
  },
  remove: async (id) => {
    return api.del(`/users/${id}`);
  },
  updateDarkMode: async (darkMode) => {
    return api.patch("/users/dark-mode", { darkMode });
  }
};
