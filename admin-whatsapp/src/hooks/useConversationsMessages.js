import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { getConversationDetail } from "../api/conversations";
import { MessagesApi } from "../api/messages";

export function useConversationDetail(conversationId) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);
  const BASE = import.meta.env.VITE_API_BASE_URL || "/api";

  // 🟢 1️⃣ Cargar datos iniciales al seleccionar conversación
  useEffect(() => {
    const loadData = async () => {
      if (!conversationId) return;
      setLoading(true);
      try {
        const convData = await getConversationDetail(conversationId);
        const msgRes = await MessagesApi.listByConversation(conversationId);
        const msgs = Array.isArray(msgRes.data) ? msgRes.data : [];
        setConversation(convData);
        setMessages(msgs);
      } catch (error) {
        console.error("Error cargando conversación:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [conversationId]);

  // 🟡 2️⃣ Conectar al socket (usa el mismo puerto donde corre tu backend)
  useEffect(() => {
    if (!conversationId) return;

    // 🔌 Conecta al backend de sockets (ajusta si usas dominio distinto)
    const socket = io(`${BASE}`); // o tu dominio
    socketRef.current = socket;

    // 🔊 Unirse al canal de esta conversación
    socket.emit("join_conversation", conversationId);

    // 👂 Escuchar nuevos mensajes emitidos por el backend (desde el trigger)
    socket.on("message_created", (newMsg) => {
      if (newMsg.conversation_id === conversationId) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === newMsg.id);
          if (exists) return prev;
          return [...prev, newMsg];
        });
      }
    });

    // 🚪 Limpiar al salir de la conversación
    return () => {
      socket.emit("leave_conversation", conversationId);
      socket.disconnect();
    };
  }, [conversationId]);

  return {
    conversation,
    messages,
    setMessages,
    loading,
  };
}