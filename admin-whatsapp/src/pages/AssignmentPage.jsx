import { useState, useEffect, useMemo } from "react";
import { useTheme } from "../context/ThemeContext";
import AssignmentTableFull from "../components/assignments/AssignmentTableFull";
import StatusFormDialog from "../components/assignments/StatusFormDialog";
import { AssignmentsApi } from "../api/assignments";
import { useAlert } from "../utils/alert";
import ChatWindow from "../components/messages/ChatWindow";
import { useConversationDetail } from "../hooks/useConversationsMessages";
import { useAssignments } from "../hooks/useAssignments";

export default function AssignmentPage() {
  const { darkMode } = useTheme();
  const { showSnack } = useAlert();
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editAssignment, setEditAssignment] = useState(null);
  const [activeTab, setActiveTab] = useState("active");
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  const { conversation: chat, messages, loading: loadingChat } =
    useConversationDetail(selectedConversationId);

  const { assignments, setAssignments } = useAssignments();

  // Estados de asignaciones
  const ACTIVE_STATUSES = ["En proceso"];
  const HISTORY_STATUSES = [
    "Rechazado",
    "Aprobado No Concretado",
    "Aprobado",
    "Vendido",
  ];

  // 🔹 Token de sesión (asumiendo JWT en localStorage)
  const token = localStorage.getItem("token");

  // 🔹 Fetch inicial — solo las asignaciones del usuario autenticado
 useEffect(() => {
  fetchMyAssignments();
}, []);

const fetchMyAssignments = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/assignments/my-assignments", {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Error al obtener tus asignaciones");

    const data = await res.json();
    setAssignments(data.data || []);
  } catch (err) {
    console.error(err);
    showSnack("Error al cargar tus asignaciones", "error");
  } finally {
    setLoading(false);
  }
};


  const handleEdit = (assignment) => {
    setEditAssignment(assignment);
    setOpenDialog(true);
  };

  const handleSubmit = async (id, status) => {
    try {
      if (id) {
        const updated = await AssignmentsApi.update(id, {
          status_assignment: status,
        });
        setAssignments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
        );
        showSnack("Asignación actualizada", "success");
      } else {
        const created = await AssignmentsApi.create({
          conversation_id: 1,
          user_id: 1,
          status: "active",
        });
        setAssignments((prev) => [created, ...prev]);
        showSnack("Asignación creada", "success");
      }
      setOpenDialog(false);
    } catch (e) {
      showSnack(e.message || "Error al guardar", "error");
    }
  };

  // 🔹 Filtrado según pestaña activa
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      return activeTab === "active"
        ? ACTIVE_STATUSES.includes(a.status_assignment)
        : HISTORY_STATUSES.includes(a.status_assignment);
    });
  }, [assignments, activeTab]);

  // 🔹 Abrir chat de conversación vinculada
  const handleOpenChat = (assignment) => {
    if (!assignment.conversation_id) {
      showSnack("Esta asignación no tiene conversación vinculada", "warning");
      return;
    }
    setSelectedConversationId(assignment.conversation_id);
  };

  return (
    <div
      className={`p-6 h-[calc(100vh-120px)] ${
        darkMode ? "bg-[#121212] text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <h1 className="text-2xl font-semibold mb-4">Mis asignaciones</h1>

      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "active"
              ? "border-b-2 border-[#960b2b] text-[#960b2b]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Activas
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "history"
              ? "border-b-2 border-[#960b2b] text-[#960b2b]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Historial
        </button>
      </div>

      {/* Tabla con búsqueda y paginación interna */}
      <AssignmentTableFull
        assignments={filteredAssignments}
        loading={loading}
        onEdit={handleEdit}
        onOpenChat={handleOpenChat}
      />

      {/* Diálogo de status */}
      <StatusFormDialog
        open={openDialog}
        assignment={editAssignment}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSubmit}
      />

      {/* Chat Modal */}
      {selectedConversationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div
            className={`w-[600px] h-[80vh] rounded-xl shadow-lg flex flex-col ${
              darkMode ? "bg-[#1f1f1f]" : "bg-white"
            }`}
          >
            {loadingChat ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Cargando chat...
              </div>
            ) : chat ? (
              <ChatWindow
                chat={chat}
                messages={messages}
                loading={loadingChat}
                darkMode={darkMode}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                No se encontró la conversación
              </div>
            )}

            <div className="p-2 flex justify-end border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setSelectedConversationId(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
