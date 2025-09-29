import { useState, useEffect } from "react";
import { getConversations } from "../api/conversations";
import { getConversationDetail } from "../api/conversations";
import { MessagesApi } from "../api/messages";

export function useConversationsWithDetail(conversationId = null, convInterval = 5000, msgInterval = 3000) {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(conversationId);
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

  // Polling de detalle y mensajes
  useEffect(() => {
    if (!selectedId) return;

    const fetchChat = async () => {
      setLoading(true);
      try {
        const detail = await getConversationDetail(selectedId);
        setChat(detail);

        const msgs = await MessagesApi.listByConversation(selectedId);
        setMessages(msgs?.data || []);
      } catch (err) {
        console.error("Error cargando chat:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
    const id = setInterval(fetchChat, msgInterval);
    return () => clearInterval(id);
  }, [selectedId, msgInterval]);

  const selectConversation = (id) => setSelectedId(id);

  return { conversations, selectedId, selectConversation, chat, messages, loading };
}
