import { useState, useEffect, useMemo } from "react";
import { useTheme } from "../context/ThemeContext";
import AssignmentTableFull from "../components/assignments/AssignmentTableFull";
import StatusFormDialog from "../components/assignments/StatusFormDialog";
import { AssignmentsApi } from "../api/assignments";
import { useAlert } from "../utils/alert";
import Pagination from "../components/common/TablePagination";
import ChatWindow from "../components/messages/ChatWindow";
import { getConversationDetail } from "../api/conversations";
import { useAssignments } from "../hooks/useAssignments";

export default function AssignmentPage() {
  const { darkMode } = useTheme();
  const { showSnack } = useAlert();

  const [setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editAssignment, setEditAssignment] = useState(null);
  const [activeTab, setActiveTab] = useState("active");

  const [selectedConversation, setSelectedConversation] = useState(null);
  const { assignments, setAssignments, loading, reload } = useAssignments();

  // Estados de asignaciones
  const ACTIVE_STATUSES = ["En proceso"];
  const HISTORY_STATUSES = ["Rechazado", "Aprobado No Concretado", "Aprobado", "Vendido"];

  // Fetch inicial
  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const data = await AssignmentsApi.list();
      setAssignments(data);
    } catch (err) {
      console.error(err);
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
        const updated = await AssignmentsApi.update(id, { status_assignment: status });
        setAssignments(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
        showSnack("Asignación actualizada", "success");
      } else {
        const created = await AssignmentsApi.create({ conversation_id: 1, user_id: 1, status: "active" });
        setAssignments(prev => [created, ...prev]);
        showSnack("Asignación creada", "success");
      }
      setOpenDialog(false);
    } catch (e) {
      showSnack(e.message || "Error al guardar", "error");
    }
  };

  // Filtrado por pestaña
  const filteredAssignments = useMemo(() => {
    return assignments.filter(a => {
      return activeTab === "active"
        ? ACTIVE_STATUSES.includes(a.status_assignment)
        : HISTORY_STATUSES.includes(a.status_assignment);
    });
  }, [assignments, activeTab]);

  // Abrir chat
  const handleOpenChat = async (assignment) => {
    if (!assignment.conversation_id) return;

    try {
      const conversation = await getConversationDetail(assignment.conversation_id);
      setSelectedConversation(conversation);
    } catch (err) {
      showSnack("Error al cargar la conversación", "error");
    }
  };

  return (
    <div className={`p-6 h-[calc(100vh-120px)] ${darkMode ? "bg-[#121212] text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      <h1 className="text-2xl font-semibold mb-4">Asignaciones</h1>

      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 text-sm font-medium ${activeTab === "active" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          Activas
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 text-sm font-medium ${activeTab === "history" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          Historial
        </button>
      </div>

      {/* Tabla con búsqueda y paginación interna */}
      <AssignmentTableFull
        assignments={filteredAssignments}
        loading={loading}
        onEdit={handleEdit}
        onOpenChat={handleOpenChat} // ✅ Agregamos la acción de chat
      />

      {/* Dialogo de status */}
      <StatusFormDialog
        open={openDialog}
        assignment={editAssignment}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSubmit}
      />

      {/* Chat Modal */}
      {selectedConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-[600px] h-[80vh] bg-white dark:bg-[#1f1f1f] rounded-xl shadow-lg flex flex-col">
            <ChatWindow chat={selectedConversation} darkMode={darkMode} />
            <div className="p-2 flex justify-end border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setSelectedConversation(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
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
