import { useState, useEffect } from "react";
import { getConversations, getConversationDetail } from "../api/conversations";
import { MessagesApi } from "../api/messages";

// Hook para actualizar lista de conversaciones automáticamente
export function useConversationsPolling(interval = 5000) {
  const [conversations, setConversations] = useState([]);

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
    const id = setInterval(fetchConversations, interval);
    return () => clearInterval(id);
  }, [interval]);

  return { conversations };
}

// Hook para actualizar mensajes de una conversación automáticamente
export function useMessagesPolling(conversationId, interval = 3000) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      try {
        const res = await MessagesApi.listByConversation(conversationId);
        setMessages(res?.data || []);
      } catch (err) {
        console.error("Error cargando mensajes:", err);
      }
    };

    fetchMessages();
    const id = setInterval(fetchMessages, interval);

    return () => clearInterval(id);
  }, [conversationId, interval]);

  return { messages };
}
