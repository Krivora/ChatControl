import { useState, useRef, useEffect } from "react";
import { useWhatsApp } from "../../hooks/useWhatsapp";
import { UsersApi } from "../../api/users";
import { AssignmentsApi } from "../../api/assignments";
import { CustomersApi } from "../../api/customers";
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
  const messagesa = [...(chat?.messages || [])];

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
      showSnack(res.error || "No se pudo enviar el mensaje ❌", "error");
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
      showSnack("Nombre actualizado ✅", "success");
    } catch (err) {
      console.error("Error al renombrar cliente:", err);
      showSnack(err.message || "No se pudo actualizar el nombre ❌", "error");
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
            ? "⚠️ Este usuario ya está asignado a la conversación."
            : "⚠️ Esta conversación ya tiene un asesor asignado.",
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
          ? "Usuario asignado y mensaje enviado 🎉"
          : "Usuario asignado, pero el mensaje no se pudo enviar ⚠️",
        enviado ? "success" : "warning"
      );
    } catch (err) {
      console.error("Error al asignar:", err);
      showSnack(err.message || "Ocurrió un error al asignar usuario ❌", "error");
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div
        className={`p-4 border-b font-semibold flex-shrink-0 flex items-center gap-2 ${darkMode
          ? "bg-[#1f1f1f] border-gray-700 text-white"
          : "bg-white border-gray-200 text-gray-900"
          }`}
      >
        {editingName ? (
          <>
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") setEditingName(false);
              }}
              disabled={savingName}
              className={`flex-1 rounded-lg px-2 py-1 text-sm font-normal outline-none border ${darkMode
                ? "bg-[#2a2a2a] text-white border-gray-600"
                : "bg-white text-gray-900 border-gray-300"
                }`}
            />
            <button
              onClick={handleRename}
              disabled={savingName}
              className="text-sm px-3 py-1 rounded-lg bg-[#960b2b] text-white hover:bg-[#7d0923] disabled:opacity-50"
            >
              {savingName ? "..." : "Guardar"}
            </button>
            <button
              onClick={() => setEditingName(false)}
              disabled={savingName}
              className="text-sm px-2 py-1 text-gray-400 hover:text-gray-600"
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <span className="flex-1 truncate">{customerName || "Cliente"}</span>
            <button
              onClick={() => {
                setNameDraft(customerName || "");
                setEditingName(true);
              }}
              title="Cambiar nombre"
              className="text-sm font-normal text-gray-400 hover:text-[#960b2b]"
            >
              ✏️
            </button>
          </>
        )}
      </div>

      {/* Mensajes */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 scrollbar-hidden">
        {chatEntries.map((msg) => {
          const isBot = msg.sender === "bot";
          const justify = isBot ? "justify-end" : "justify-start";
          const bubbleClass = isBot
            ? "bg-[#960b2b] text-white rounded-br-none"
            : "bg-gray-300 text-gray-900 rounded-bl-none";

          // Convertir fecha a hora local
          let dateStr = "Hora desconocida";
          if (msg.created_at) {
            // Formato ISO básico
            const dateISO = msg.created_at.replace(" ", "T").split(".")[0];
            const d = new Date(dateISO);

            if (!isNaN(d.getTime())) {
              // Ajuste manual a la hora deseada (ejemplo: -14 horas para que 11:55 a.m. sea 9:55 p.m.)
              d.setHours(d.getHours() - 14); // ajusta según tu diferencia exacta

              dateStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
            }
          }
          return (
            <div key={msg.id} className={`flex ${justify}`}>
              <div className={`px-4 py-2 rounded-lg max-w-xs break-words shadow ${bubbleClass}`}>
                <p className="whitespace-pre-line">{msg.content}</p>
                <span className="text-[11px] opacity-70 block mt-1 text-right">{dateStr}</span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className={`p-3 flex gap-2 border-t flex-shrink-0 ${darkMode ? "bg-[#1f1f1f] border-gray-700" : "bg-white border-gray-200"
          }`}
      >
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className={`flex-1 rounded-lg px-3 py-2 text-sm outline-none ${darkMode ? "bg-[#2a2a2a] text-white" : "bg-gray-100 text-gray-900"
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
        canAssign && ( // 👈 solo muestra si cumple con el rol
          <button
            onClick={() => setShowModal(true)}
            disabled={loading}
            className="bg-[#960b2b] text-white px-4 py-2 rounded-lg hover:bg-[#7d0923]"
          >
            Asignar
          </button>
        )
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