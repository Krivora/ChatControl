import { useState, useEffect } from "react";
import { getConversations, getConversationDetail } from "../api/conversations";
import { MessagesApi } from "../api/messages";

export function useConversationWithPolling(selectedId = null, convInterval = 5000, msgInterval = 3000) {
  const [conversations, setConversations] = useState([]);
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Polling de conversaciones
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversations();
        setConversations(data || []);
      } catch (err) {
        console.error("Error cargando conversaciones:", err);
      }
    };
    fetchConversations();
    const id = setInterval(fetchConversations, convInterval);
    return () => clearInterval(id);
  }, [convInterval]);

  // Polling de detalle de conversación y mensajes
  useEffect(() => {
    if (!selectedId) return;

    const fetchChatAndMessages = async () => {
      setLoading(true);
      try {
        const detail = await getConversationDetail(selectedId);
        setChat(detail);

        const msgs = await MessagesApi.listByConversation(selectedId);
        setMessages(msgs?.data || []);
      } catch (err) {
        console.error("Error cargando detalle o mensajes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChatAndMessages();
    const id = setInterval(fetchChatAndMessages, msgInterval);
    return () => clearInterval(id);
  }, [selectedId, msgInterval]);

  return { conversations, chat, messages, loading };
}
