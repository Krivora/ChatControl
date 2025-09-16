// src/api/slots.js
import { api } from "./client";

export function getAvailableSlots(date) {
  // date en formato YYYY-MM-DD
  return api.get(`/slots/${date}`);
}
