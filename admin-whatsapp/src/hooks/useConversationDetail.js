// src/hooks/useConversationDetail.js
import { useEffect, useState } from "react";
import { getConversationDetail } from "../api/conversations";

export function useConversationDetail(conversationId) {
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!conversationId) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await getConversationDetail(conversationId);
        setChat(data);
      } catch (err) {
        console.error("Error al cargar detalle de conversación", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [conversationId]);

  return { chat, loading };
}
