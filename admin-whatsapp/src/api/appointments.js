import { api } from "./client";

export const AppointmentsApi = {
  list: (params = {}) => api.get("/appointments", { params }),
  get: (id) => api.get(`/appointments/${id}`),
  create: ({ conversationId, date, timeStart, timeEnd }) =>
    api.post("/appointments", {
      conversation_id: conversationId,
      date,
      time_start: timeStart,
      time_end: timeEnd,
    }),
  update: (id, payload) => api.put(`/appointments/${id}`, payload),
  cancel: (id) => api.put(`/appointments/${id}`, { status: "cancelled" }),
  remove: (id) => api.delete(`/appointments/${id}`),
  dates: () => api.get("/appointments/dates/all"),
};
