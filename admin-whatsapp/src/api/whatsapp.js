import { api } from "./client";

// `conversation_id` es obligatorio en el backend: sin él la ruta responde 400
// y el mensaje nunca sale.
export function sendWhatsAppMessage({ to, body, conversation_id }) {
  return api.post("/whatsapp/send", { to, body, conversation_id });
}
