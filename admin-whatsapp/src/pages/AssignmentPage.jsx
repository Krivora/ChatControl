import { useState, useEffect, useMemo } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext"; 
import AssignmentTableFull from "../components/assignments/AssignmentTableFull";
import StatusFormDialog from "../components/assignments/StatusFormDialog";
import { AssignmentsApi } from "../api/assignments";
import { UsersApi } from "../api/users";
import { useAlert } from "../utils/alert";
import ChatWindow from "../components/messages/ChatWindow";
import { Close } from "@mui/icons-material";
import { useConversationDetail } from "../hooks/useConversationsMessages";
import { useAssignments } from "../hooks/useAssignments";

const ACTIVE_STATUSES = ["Aprobado", "Aprobado No Concretado", "En proceso"];
const HISTORY_STATUSES = ["Rechazado", "Descartado", "Vendido"];

export default function AssignmentPage() {
  const { darkMode } = useTheme();
  const { user } = useAuth(); 
  const { showSnack } = useAlert();
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editAssignment, setEditAssignment] = useState(null);
  const [activeTab, setActiveTab] = useState("active");
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [users, setUsers] = useState([]);

  const { conversation: chat, messages, loading: loadingChat } =
    useConversationDetail(selectedConversationId);

  const { assignments, setAssignments } = useAssignments();

  useEffect(() => {
    fetchAssignments();
    fetchUsers();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const data = await AssignmentsApi.list();
      setAssignments(data);
    } catch (err) {
      console.error(err);
      showSnack("Error al cargar asignaciones", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await UsersApi.list();
      setUsers(Array.isArray(data) ? data : []); // 🔒 aseguramos arreglo
    } catch (err) {
      console.error(err);
      showSnack("Error al cargar usuarios", "error");
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
        setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
        showSnack("Asignación actualizada", "success");
      } else {
        const created = await AssignmentsApi.create({ conversation_id: 1, user_id: 1, status: "active" });
        setAssignments((prev) => [created, ...prev]);
        showSnack("Asignación creada", "success");
      }
      setOpenDialog(false);
    } catch (e) {
      showSnack(e.message || "Error al guardar", "error");
    }
  };

  // 🔹 Visibles según rol: el asesor solo ve las suyas
  const visibleAssignments = useMemo(() => {
    const role = user?.role?.toLowerCase?.() || "";
    if (role === "usuario") return assignments.filter(a => a.user_id === user.id);
    return assignments;
  }, [assignments, user]);

  // 🔹 Contadores de pestañas sobre lo visible
  const activeCount = useMemo(
    () => visibleAssignments.filter(a => ACTIVE_STATUSES.includes(a.status_assignment)).length,
    [visibleAssignments]
  );
  const historyCount = useMemo(
    () => visibleAssignments.filter(a => HISTORY_STATUSES.includes(a.status_assignment)).length,
    [visibleAssignments]
  );

  // 🔹 Filtrado por pestaña
  const filteredAssignments = useMemo(
    () =>
      visibleAssignments.filter(a =>
        activeTab === "active"
          ? ACTIVE_STATUSES.includes(a.status_assignment)
          : HISTORY_STATUSES.includes(a.status_assignment)
      ),
    [visibleAssignments, activeTab]
  );

  const handleOpenChat = (assignment) => {
    if (!assignment.conversation_id) {
      showSnack("Esta asignación no tiene conversación vinculada", "warning");
      return;
    }
    setSelectedConversationId(assignment.conversation_id);
  };

  return (
    <div className={darkMode ? "text-gray-100" : "text-gray-900"}>
      {/* Tabs */}
      <div
        className={`inline-flex gap-1 p-1 rounded-xl mb-4 ${
          darkMode ? "bg-[#1a1a1a] border border-gray-800" : "bg-gray-200/60"
        }`}
      >
        {[
          { id: "active", label: "Activas", count: activeCount },
          { id: "history", label: "Historial", count: historyCount },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? darkMode
                    ? "bg-[#2a1119] text-white shadow-sm"
                    : "bg-white text-[#960b2b] shadow-sm"
                  : darkMode
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? "bg-[#960b2b] text-white"
                    : darkMode
                    ? "bg-[#2a2a2a] text-gray-400"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tabla */}
      <AssignmentTableFull
        assignments={filteredAssignments}
        users={users}
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setSelectedConversationId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-2xl h-[80vh] rounded-2xl shadow-2xl border flex flex-col overflow-hidden ${
              darkMode ? "bg-[#161616] border-gray-800" : "bg-gray-50 border-gray-200"
            }`}
          >
            <div
              className={`flex items-center justify-between px-4 h-[52px] flex-shrink-0 border-b ${
                darkMode ? "border-gray-800" : "border-gray-200 bg-white"
              }`}
            >
              <span className="text-sm font-semibold">Conversación</span>
              <button
                onClick={() => setSelectedConversationId(null)}
                title="Cerrar"
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                  darkMode
                    ? "text-gray-400 hover:bg-[#2a2a2a] hover:text-white"
                    : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                }`}
              >
                <Close fontSize="small" />
              </button>
            </div>

            <div className="flex-1 min-h-0">
              {loadingChat ? (
                <div className="h-full flex items-center justify-center text-sm text-gray-400">
                  Cargando chat...
                </div>
              ) : chat ? (
                <ChatWindow chat={chat} messages={messages} loading={loadingChat} darkMode={darkMode} />
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-gray-400">
                  No se encontró la conversación
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}