import { useState, useEffect } from "react";
import { MessagesApi } from "../api/messages";

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
