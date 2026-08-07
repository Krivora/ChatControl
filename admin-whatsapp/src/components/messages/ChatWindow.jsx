import { useState, useRef, useEffect } from "react";
import { useWhatsApp } from "../../hooks/useWhatsapp";
import { UsersApi } from "../../api/users";
import { AssignmentsApi } from "../../api/assignments";
import { CustomersApi } from "../../api/customers";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { formatTime, dayKey, dayLabel } from "../../utils/datetime";
import {
  calculatePoints,
  getRange,
  initials,
  MAX_SCORE,
  formatPhone as formatPhoneFull,
} from "../../utils/scoring";
import { useAlert } from "../../utils/alert";
import { useAuth } from "../../context/AuthContext";

export default function ChatWindow({ chat, messages = [], darkMode }) {
  const [input, setInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [usersMessages, setUsersMessages] = useState([]);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [savingName, setSavingName] = useState(false);
  // Nombre local: refleja el rename al instante sin esperar a que el hook
  // de la conversación vuelva a traer los datos.
  const [customerName, setCustomerName] = useState("");
  const messagesEndRef = useRef(null);
  const { sendMessage, loading } = useWhatsApp();
  const { showSnack } = useAlert();
  const firstLoad = useRef(true);
  const { user } = useAuth();

  const canAssign = user?.role === "admin" || user?.role === "super_admin";

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
  useEffect(() => {
    firstLoad.current = true;
  }, [chat?.conversation?.id]);

  const formatPhone = (phone) => {
    if (!phone) return "";
    const s = phone.toString();
    return `${s.slice(0, 3)} ${s.slice(3, 6)} ${s.slice(6, 10)}`;
  };

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

  // Al cambiar de conversación se resincroniza el nombre y se cierra la
  // edición, para no arrastrar el borrador de un cliente a otro.
  useEffect(() => {
    setCustomerName(chat?.customer?.full_name || "");
    setEditingName(false);
  }, [chat?.customer?.id, chat?.customer?.full_name]);

  if (!chat) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-500 h-full">
        Selecciona una conversación
      </div>
    );
  }

  let chatEntries = [];

  (chat?.answers || []).forEach((a) => {
    const answerTime = new Date(a.created_at);
    const msgIndex = messages.findIndex(
      (m) =>
        m.sender === "customer" &&
        Math.abs(new Date(m.created_at) - answerTime) < 2000
    );

    if (msgIndex !== -1) {
      messages[msgIndex] = {
        ...messages[msgIndex],
        content: a.answer_value,
      };
    } else {
      messages.push({
        id: `ans-${a.id}`,
        sender: "customer",
        content: a.answer_value,
        created_at: a.created_at,
      });
    }
  });

  const score = calculatePoints(chat?.answers || []);
  const scoreRange = getRange(score);

  messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  chatEntries = messages.map((msg) => ({
    id: `msg-${msg.id}`,
    sender: msg.sender,
    content: msg.content,
    created_at: msg.created_at,
  }));
  const handleSend = async (messageToSend) => {
    if (!messageToSend.trim()) return false;

    const to = chat.customer?.whatsapp_id;
    const conversationId = chat.conversation?.id;

    if (!to) {
      showSnack("Este cliente no tiene número de WhatsApp registrado", "error");
      return false;
    }
    if (!conversationId) {
      showSnack("La conversación no tiene ID, no se puede enviar", "error");
      return false;
    }

    // El backend registra el mensaje en `messages` al enviarlo, así que
    // aquí no se vuelve a insertar.
    const res = await sendMessage(to, messageToSend, conversationId);
    if (!res.ok) {
      showSnack(res.error || "No se pudo enviar el mensaje", "error");
      return false;
    }

    setInput("");
    setShowModal(false);
    return true;
  };

  const handleRename = async () => {
    const nuevo = nameDraft.trim();

    if (!nuevo) {
      showSnack("El nombre no puede estar vacío", "warning");
      return;
    }
    if (nuevo === customerName) {
      setEditingName(false);
      return;
    }

    setSavingName(true);
    try {
      const res = await CustomersApi.rename(chat.customer?.id, nuevo);
      setCustomerName(res?.data?.full_name || nuevo);
      setEditingName(false);
      showSnack("Nombre actualizado", "success");
    } catch (err) {
      console.error("Error al renombrar cliente:", err);
      showSnack(err.message || "No se pudo actualizar el nombre", "error");
    } finally {
      setSavingName(false);
    }
  };

  const handleAssign = async (userId, message) => {
    try {
      const existing = await AssignmentsApi.listByConversation(chat.conversation?.id);
      const asignacionActiva = existing.find((a) => a.status === "active");

      // Una conversación solo puede tener un asesor a la vez.
      if (asignacionActiva) {
        showSnack(
          asignacionActiva.user_id === userId
            ? "Este usuario ya está asignado a la conversación."
            : "Esta conversación ya tiene un asesor asignado.",
          "warning"
        );
        return;
      }

      await AssignmentsApi.create({
        conversation_id: chat.conversation?.id,
        user_id: userId,
        status: "active",
      });

      const enviado = await handleSend(message);
      showSnack(
        enviado
          ? "Usuario asignado y mensaje enviado"
          : "Usuario asignado, pero el mensaje no se pudo enviar",
        enviado ? "success" : "warning"
      );
    } catch (err) {
      console.error("Error al asignar:", err);
      showSnack(err.message || "Ocurrió un error al asignar usuario", "error");
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header — tarjeta del cliente */}
      <div className={`p-3 flex-shrink-0 ${darkMode ? "bg-[#161616]" : "bg-gray-50"}`}>
        <div
          className={`rounded-2xl border p-4 shadow-sm ${darkMode
            ? "bg-[#1f1f1f] border-gray-800"
            : "bg-white border-gray-100"
            }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#960b2b] flex items-center justify-center text-white font-semibold">
              {initials(customerName)}
            </div>

            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename();
                      if (e.key === "Escape") setEditingName(false);
                    }}
                    disabled={savingName}
                    className={`flex-1 min-w-0 rounded-lg px-2 py-1 text-sm outline-none border ${darkMode
                      ? "bg-[#2a2a2a] text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                      }`}
                  />
                  <button
                    onClick={handleRename}
                    disabled={savingName}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#960b2b] text-white hover:bg-[#7d0923] disabled:opacity-50"
                  >
                    {savingName ? "..." : "Guardar"}
                  </button>
                  <button
                    onClick={() => setEditingName(false)}
                    disabled={savingName}
                    title="Cancelar"
                    className="px-1 text-gray-400 hover:text-gray-600"
                  >
                    <CloseIcon fontSize="small" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h2
                    className={`font-semibold text-lg truncate ${darkMode ? "text-white" : "text-gray-900"
                      }`}
                  >
                    {customerName || "Cliente"}
                  </h2>
                  <button
                    onClick={() => {
                      setNameDraft(customerName || "");
                      setEditingName(true);
                    }}
                    title="Cambiar nombre"
                    className="text-gray-400 hover:text-[#960b2b] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <EditOutlinedIcon sx={{ fontSize: 16 }} />
                  </button>
                </div>
              )}

              <p className="text-sm text-gray-400 truncate">
                {formatPhoneFull(chat.customer?.whatsapp_id)}
              </p>
            </div>

            <span
              className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${scoreRange.chip}`}
            >
              {scoreRange.label}
            </span>
          </div>

          {/* Barra de score */}
          <div className="flex items-center gap-3 mt-3">
            <div
              className={`h-2 flex-1 rounded-full overflow-hidden ${darkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
            >
              <div
                className={`h-full rounded-full transition-all ${scoreRange.bar}`}
                style={{ width: `${Math.min(100, (score / MAX_SCORE) * 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">
              {score} / {MAX_SCORE} pts
            </span>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <div
        className={`flex-1 min-h-0 overflow-y-auto px-4 pb-4 space-y-2 scrollbar-hidden ${darkMode ? "bg-[#161616]" : "bg-gray-50"
          }`}
      >
        {chatEntries.length === 0 && (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">
            Aún no hay mensajes en esta conversación
          </div>
        )}

        {chatEntries.map((msg, i) => {
          const isBot = msg.sender === "bot";
          const prev = chatEntries[i - 1];
          const nuevoDia = !prev || dayKey(prev.created_at) !== dayKey(msg.created_at);

          return (
            <div key={msg.id}>
              {nuevoDia && (
                <div className="flex justify-center my-4">
                  <span
                    className={`text-[11px] px-3 py-1 rounded-full ${darkMode
                      ? "bg-[#2a2a2a] text-gray-400"
                      : "bg-gray-200 text-gray-500"
                      }`}
                  >
                    {dayLabel(msg.created_at)}
                  </span>
                </div>
              )}

              <div className={`flex ${isBot ? "justify-end" : "justify-start"}`}>
                <div
                  className={`px-4 py-2.5 max-w-[75%] break-words shadow-sm ${isBot
                    ? "bg-[#960b2b] text-white rounded-2xl rounded-br-md"
                    : darkMode
                      ? "bg-[#2a2a2a] text-gray-100 rounded-2xl rounded-bl-md"
                      : "bg-white text-gray-900 border border-gray-100 rounded-2xl rounded-bl-md"
                    }`}
                >
                  <p className="whitespace-pre-line text-sm leading-relaxed">{msg.content}</p>
                  <span
                    className={`text-[10px] block mt-1 text-right ${isBot ? "text-white/70" : "text-gray-400"
                      }`}
                  >
                    {formatTime(msg.created_at)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`p-3 flex-shrink-0 ${darkMode ? "bg-[#161616]" : "bg-gray-50"}`}>
        <div
          className={`rounded-2xl border p-2 flex gap-2 items-center shadow-sm ${darkMode
            ? "bg-[#1f1f1f] border-gray-800"
            : "bg-white border-gray-100"
            }`}
        >
          <input
            type="text"
            placeholder="Escribe un mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && input.trim()) handleSend(input);
            }}
            disabled={loading}
            className={`flex-1 rounded-xl px-3 py-2 text-sm outline-none bg-transparent ${darkMode ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"
              }`}
          />
          {input.trim() ? (
            <button
              onClick={() => handleSend(input)}
              disabled={loading}
              title="Enviar"
              className="flex-shrink-0 w-10 h-10 rounded-full bg-[#960b2b] text-white hover:bg-[#7d0923] disabled:opacity-50 flex items-center justify-center transition"
            >
              <SendIcon fontSize="small" />
            </button>
          ) : (
            canAssign && ( // 👈 solo muestra si cumple con el rol
              <button
                onClick={() => setShowModal(true)}
                disabled={loading}
                className="flex-shrink-0 px-4 py-2 rounded-xl bg-[#960b2b] text-white text-sm font-medium hover:bg-[#7d0923] disabled:opacity-50 transition whitespace-nowrap"
              >
                Asignar<span className="hidden sm:inline"> asesor</span>
              </button>
            )
          )}
        </div>
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