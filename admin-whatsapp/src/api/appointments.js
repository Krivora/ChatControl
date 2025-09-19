import { api } from "./client";

export async function getAppointments() {
  const res = await api.get("/appointments");
  // 👇 Aquí está el cambio clave
  return Array.isArray(res.data) ? res.data : [];
}

export function createAppointment({ conversationId, date, timeStart, timeEnd }) {
  return api.post("/appointments", {
    conversation_id: conversationId,
    date,
    time_start: timeStart,
    time_end: timeEnd,
  });
}
