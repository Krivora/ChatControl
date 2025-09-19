import { WhatsAppRepo } from "../repositories/whatsapp.repo.js";

export const WhatsAppService = {
  async sendTextMessage(to, body) {
    const { ok, data } = await WhatsAppRepo.sendTextMessage({ to, body });

    if (!ok) {
      console.error("Error WhatsApp API:", data);
      throw new Error(data?.error?.message || "Error enviando mensaje");
    }

    return data;
  },
};
