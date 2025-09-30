import { useState, useRef, useEffect } from "react";
import { useWhatsApp } from "../../hooks/useWhatsapp";
import { UsersApi } from "../../api/users";
import { AssignmentsApi } from "../../api/assignments";
import { useAlert } from "../../utils/alert";
import { MessagesApi } from "../../api/messages";

export default function ChatWindow({ chat, messages = [], darkMode }) {
  const [input, setInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [usersMessages, setUsersMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const { sendMessage, loading } = useWhatsApp();
  const { showSnack } = useAlert();

  const firstLoad = useRef(true);

  // 🧭 Scroll automático (baja solo si el usuario está al final)
  useEffect(() => {
    const container = messagesEndRef.current?.parentElement;
    if (!container) return;

    const isAtBottom =
      Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) < 50;

    if (isAtBottom || firstLoad.current) {
      messagesEndRef.current?.scrollIntoView({
        behavior: firstLoad.current ? "auto" : "smooth",
      });
      firstLoad.current = false;
    }
  }, [messages]);

  // 🔁 Cuando cambia de conversación, resetea el scroll
  useEffect(() => {
    firstLoad.current = true;
  }, [chat?.conversation?.id]);

  // 📞 Formato de teléfono
  const formatPhone = (phone) => {
    if (!phone) return "";
    const s = phone.toString();
    return `${s.slice(0, 3)} ${s.slice(3, 6)} ${s.slice(6, 10)}`;
  };

  // 👥 Cargar lista de usuarios para asignar
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await UsersApi.list();
        const allUsers = Array.isArray(res) ? res : res?.data || [];
        const activeUsers = allUsers.filter((u) => !u.deleted_at);

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

  // 🧩 Construcción de mensajes sin duplicados
  const chatEntries = [];

  // 1️⃣ Primer mensaje del cliente (si existe)
  const customerMessages = (chat?.messages || []).filter((m) => m.sender === "customer");
  if (customerMessages.length > 0) {
    const firstMsg = customerMessages[0];
    chatEntries.push({
      id: `cust-${firstMsg.id}`,
      sender: "customer",
      content: firstMsg.content,
      created_at: firstMsg.created_at,
    });
  }

  // 2️⃣ Mensajes del bot + respuesta correspondiente (si hay)
  (chat?.messages || [])
    .filter((m) => m.sender === "bot")
    .forEach((botMsg, i) => {
      chatEntries.push({
        id: `bot-${botMsg.id}`,
        sender: "bot",
        content: botMsg.content,
        created_at: botMsg.created_at,
      });

      const answer = chat.answers?.[i];
      if (answer && !customerMessages.some((m) => m.id === answer.id)) {
        chatEntries.push({
          id: `ans-${answer.id}`,
          sender: "user",
          content: answer.answer_value,
          created_at: answer.created_at,
        });
      }
    });

  // 3️⃣ Agregar mensajes nuevos del socket (realtime)
  (messages || []).forEach((m) => {
    const exists = chatEntries.some(
      (x) => x.id === m.id || x.content === m.content
    );
    if (!exists) {
      chatEntries.push({
        id: m.id,
        sender: m.sender,
        content: m.content,
        created_at: m.created_at,
      });
    }
  });

  // 4️⃣ Ordenar cronológicamente
  chatEntries.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  // ✉️ Enviar mensaje manual
  const handleSend = async (messageToSend) => {
    if (!messageToSend.trim()) return;

    const to = chat.customer?.whatsapp_id;
    if (!to) {
      alert("Este cliente no tiene número de WhatsApp registrado");
      return;
    }

    const res = await sendMessage(to, messageToSend);
    if (res.ok) {
      await MessagesApi.create({
        conversation_id: chat.conversation?.id,
        content: messageToSend,
        content_type: "text",
      });

      setInput("");
      setShowModal(false);
    }
  };

  // 👤 Asignar usuario + enviar mensaje
  const handleAssign = async (userId, message) => {
    try {
      const existing = await AssignmentsApi.listByConversation(chat.conversation?.id);
      const yaAsignado = existing.find((a) => a.user_id === userId && a.status === "active");

      if (yaAsignado) {
        showSnack("⚠️ Este usuario ya está asignado a la conversación.", "warning");
        return;
      }

      await AssignmentsApi.create({
        conversation_id: chat.conversation?.id,
        user_id: userId,
        status: "active",
      });

      const ok = await handleSend(message);
      if (ok) showSnack("Usuario asignado y mensaje enviado 🎉", "success");
    } catch (err) {
      console.error("Error al asignar:", err);
      showSnack("Ocurrió un error al asignar usuario ❌", "error");
    }
  };

  // 🎨 Render
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
          const justify = isBot ? "justify-end" : "justify-start";

          const bubbleClass = isBot
            ? "bg-[#960b2b] text-white rounded-br-none"
            : "bg-gray-300 text-gray-900 rounded-bl-none";

          return (
            <div key={msg.id} className={`flex ${justify}`}>
              <div
                className={`px-4 py-2 rounded-lg max-w-xs break-words shadow ${bubbleClass}`}
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

      {/* Input */}
      <div
        className={`p-3 flex gap-2 border-t flex-shrink-0 ${
          darkMode ? "bg-[#1f1f1f] border-gray-700" : "bg-white border-gray-200"
        }`}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white dark:bg-[#2a2a2a] rounded-xl w-96 shadow-lg flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Selecciona un usuario
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {usersMessages.length > 0 ? (
                usersMessages.map((u) => (
                  <button
                    key={u.id}
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
