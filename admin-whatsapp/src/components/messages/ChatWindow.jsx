import React, { useState, useRef, useEffect } from "react";
import { useWhatsApp } from "../../hooks/useWhatsapp";
import { UsersApi } from "../../api/users";
import { AssignmentsApi } from "../../api/assignments";
import { useAlert } from "../../utils/alert";

export default function ChatWindow({ chat, darkMode }) {
  const [input, setInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [usersMessages, setUsersMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const { sendMessage, loading } = useWhatsApp();
  const { showSnack } = useAlert();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const formatPhone = (phone) => {
    if (!phone) return "";
    const s = phone.toString();
    return `${s.slice(0, 3)} ${s.slice(3, 6)} ${s.slice(6, 10)}`;
  };

  // Traer usuarios y preparar mensaje de asignación
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await UsersApi.list();
        const allUsers = Array.isArray(res) ? res : res?.data || [];
        const activeUsers = allUsers.filter((u) => !u.deleted_at);

        // Guardamos {id, msg}
        const msgs = activeUsers.map((u) => ({
          id: u.id,
          msg: `${u.nombre} ${u.apellido}, tu asesor, te contactará desde ${formatPhone(
            u.telefono
          )} para asegurarse de que tu experiencia sea rápida, fácil y sin complicaciones.`,
        }));

        setUsersMessages(msgs);
      } catch (error) {
        console.error("Error al traer usuarios:", error);
        setUsersMessages([]);
      }
    };
    fetchUsers();
  }, []);

  if (!chat) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-500 h-full">
        Selecciona una conversación
      </div>
    );
  }

  const chatEntries = [];
  chat.messages
    .filter((m) => m.sender === "bot")
    .forEach((botMsg, index) => {
      chatEntries.push({
        id: `bot-${botMsg.id}`,
        sender: "bot",
        content: botMsg.content,
        created_at: botMsg.created_at,
      });
      const answer = chat.answers?.[index];
      if (answer) {
        chatEntries.push({
          id: `ans-${answer.id}`,
          sender: "answer",
          content: answer.answer_value,
          created_at: answer.created_at,
        });
      }
    });

  chatEntries.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const handleSend = async (messageToSend) => {
    if (!messageToSend.trim()) return;

    const to = chat.customer?.whatsapp_id;
    if (!to) {
      alert("Este cliente no tiene número de WhatsApp registrado");
      return;
    }

    const res = await sendMessage(to, messageToSend);
    if (res.ok) {
      setInput("");
      setShowModal(false);
      return true;
    }
    return false;
  };

  // 🔹 Guardar asignación en DB y mandar mensaje
  const handleAssign = async (userId, message) => {
    try {
      // 1. Checar si ya existe asignación activa para esta conversación y usuario
      const existing = await AssignmentsApi.listByConversation(chat.conversation?.id);

      const yaAsignado = existing.find(
        (a) => a.user_id === userId && a.status === "active"
      );

      if (yaAsignado) {
        showSnack("Este usuario ya está asignado a la conversación ⚠️", "warning");
        return;
      }

      // 2. Crear asignación
      await AssignmentsApi.create({
        conversation_id: chat.conversation?.id,
        user_id: userId,
        status: "active",
      });

      // 3. Enviar mensaje
      const ok = await handleSend(message);

      if (ok) {
        showSnack("Usuario asignado y mensaje enviado 🎉", "success");
      }
    } catch (err) {
      console.error("Error al asignar:", err);
      showSnack("Ocurrió un error al asignar usuario ❌", "error");
    }
  };



  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div
        className={`p-4 border-b font-semibold flex-shrink-0 ${
          darkMode
            ? "bg-[#1f1f1f] border-gray-700 text-white"
            : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        {chat.customer?.full_name || "Cliente"}
      </div>

      {/* Mensajes */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 scrollbar-hidden">
        {chatEntries.map((msg) => {
          const isBot = msg.sender === "bot";
          const isAnswer = msg.sender === "answer";

          return (
            <div
              key={msg.id}
              className={`flex ${
                isAnswer ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs break-words shadow ${
                  isBot
                    ? "bg-[#960b2b] text-white rounded-br-none"
                    : darkMode
                    ? "bg-[#2a2a2a] text-white rounded-bl-none"
                    : "bg-gray-200 text-gray-900 rounded-bl-none"
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>
                <span className="text-[11px] opacity-70 block mt-1 text-right">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input y botón dinámico */}
      <div
        className={`p-3 flex gap-2 border-t flex-shrink-0 ${
          darkMode ? "bg-[#1f1f1f] border-gray-700" : "bg-white border-gray-200"
        }`}
        style={{ minHeight: 56 }}
      >
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className={`flex-1 rounded-lg px-3 py-2 text-sm outline-none ${
            darkMode ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-gray-900"
          }`}
        />

        {input.trim() ? (
          <button
            onClick={() => handleSend(input)}
            disabled={loading}
            className="bg-[#960b2b] text-white px-4 py-2 rounded-lg hover:bg-[#7d0923]"
          >
            {loading ? "Enviando..." : "Enviar"}
          </button>
        ) : (
          <button
            onClick={() => setShowModal(true)}
            disabled={loading}
            className="bg-[#960b2b] text-white px-4 py-2 rounded-lg hover:bg-[#7d0923]"
          >
            Asignar
          </button>
        )}
      </div>

      {/* Modal de selección */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white dark:bg-[#2a2a2a] rounded-xl w-96 shadow-lg flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Selecciona un usuario
              </h3>
            </div>

            {/* Lista scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {usersMessages.length > 0 ? (
                usersMessages.map((u, i) => (
                  <button
                    key={i}
                    onClick={() => handleAssign(u.id, u.msg)}
                    className="w-full px-4 py-2 rounded-lg bg-[#960b2b] text-white hover:bg-[#7d0923] text-left whitespace-normal break-words shadow-sm"
                  >
                    {u.msg}
                  </button>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No hay usuarios disponibles.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
