import { api } from "./client";

export function sendWhatsAppMessage({ to, body }) {
  return api.post("/whatsapp/send", { to, body });
}
