import { api } from "./client";

// `api.get` solo acepta la ruta, así que los filtros se serializan aquí.
const toQuery = (params = {}) => {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  const qs = new URLSearchParams(entries).toString();
  return qs ? `?${qs}` : "";
};

export const AppointmentsApi = {
  list: (params = {}) => api.get(`/appointments${toQuery(params)}`),
  get: (id) => api.get(`/appointments/${id}`),
  create: ({ conversationId, date, timeStart, timeEnd }) =>
    api.post("/appointments", {
      conversation_id: conversationId,
      date,
      time_start: timeStart,
      time_end: timeEnd,
    }),
  update: (id, payload) => api.put(`/appointments/${id}`, payload),
  cancel: (id, payload) => api.put(`/appointments/${id}`, payload),
  remove: (id) => api.del(`/appointments/${id}`),
  dates: () => api.get("/appointments/dates/all"),
};
