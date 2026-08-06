import { useState } from "react";
import { sendWhatsAppMessage } from "../api";

export function useWhatsApp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendMessage = async (to, body, conversationId) => {
    setLoading(true);
    setError("");
    try {
      const res = await sendWhatsAppMessage({ to, body, conversation_id: conversationId });
      return { ok: true, data: res.data };
    } catch (err) {
      setError(err.message || "Error enviando mensaje");
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading, error };
}
