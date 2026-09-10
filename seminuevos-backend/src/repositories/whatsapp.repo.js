// src/repositories/whatsapp.repo.js
//
// Adaptador de la WhatsApp Cloud API. Es el único módulo que conoce el
// formato de la petición de Meta: cambiar de proveedor de mensajería sólo
// debería obligar a reescribir este archivo.
import { env } from "../config/env.js";

const API_URL = `https://graph.facebook.com/${env.WHATSAPP_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
const TIMEOUT_MS = 10_000;

export const WhatsAppRepo = {
  async sendTextMessage({ to, body }) {
    // Sin timeout, una llamada colgada bloquea el job de seguimiento entero.
    const signal = AbortSignal.timeout(TIMEOUT_MS);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body },
        }),
        signal,
      });

      const data = await res.json().catch(() => null);
      return { ok: res.ok, data };
    } catch (err) {
      const reason = err.name === "TimeoutError" ? "tiempo de espera agotado" : err.message;
      return { ok: false, data: { error: { message: `No se pudo contactar la Cloud API: ${reason}` } } };
    }
  },
};
