import { api } from "./client";

export function getAppointments() {
  return api.get("/appointments"); // backend devuelve todas las citas con fecha, hora_inicio, hora_fin
}

export function createAppointment({ conversationId, date, timeStart, timeEnd }) {
  return api.post("/appointments", {
    conversation_id: conversationId,
    date,
    time_start: timeStart,
    time_end: timeEnd,
  });
}
