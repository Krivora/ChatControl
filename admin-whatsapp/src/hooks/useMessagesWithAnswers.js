import { useState, useEffect } from "react";
import { MessagesApi } from "../api/messages";
import { getConversationDetail } from "../api/conversations";

export function useMessagesWithAnswers(conversationId, msgInterval = 3000) {
  const [messages, setMessages] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Traer el detalle (solo una vez) para obtener las answers
  useEffect(() => {
    if (!conversationId) return;

    const fetchDetail = async () => {
      try {
        const detail = await getConversationDetail(conversationId);
        setAnswers(detail.answers || []);
      } catch (err) {
        console.error("Error cargando detalle:", err);
      }
    };

    fetchDetail();
  }, [conversationId]);

  // Polling de mensajes
  useEffect(() => {
    if (!conversationId) return;

    setLoading(true);

    const fetchMessages = async () => {
      try {
        const res = await MessagesApi.listByConversation(conversationId);
        setMessages(res?.data || []);
      } catch (err) {
        console.error("Error cargando mensajes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    const id = setInterval(fetchMessages, msgInterval);
    return () => clearInterval(id);
  }, [conversationId, msgInterval]);

  return { messages, answers, loading };
}
