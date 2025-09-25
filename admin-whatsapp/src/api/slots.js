import { api } from "./client";

export function getAvailableSlots(date) {
  return api.get(`/slots/${date}`);
}
