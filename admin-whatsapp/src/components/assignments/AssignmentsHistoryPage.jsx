import { useState, useEffect, useMemo } from "react";
import { useTheme } from "../context/ThemeContext";
import AssignmentTableFull from "../components/assignments/AssignmentTableFull";
import StatusFormDialog from "../components/assignments/StatusFormDialog";
import { AssignmentsApi } from "../api/assignments";
import { useAlert } from "../utils/alert";
import Pagination from "../components/common/TablePagination";

export default function AssignmentsHistoryPage() {
  const { darkMode } = useTheme();
  const { showSnack } = useAlert();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editAssignment, setEditAssignment] = useState(null);
  const [activeTab, setActiveTab] = useState("history"); // directamente historial

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const HISTORY_STATUSES = ["Rechazado", "Aprobado No Concretado"];

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const data = await AssignmentsApi.list();
      setAssignments(data);
    } catch (err) {
      console.error("Error cargando asignaciones", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (assignment) => {
    setEditAssignment(assignment);
    setOpenDialog(true);
  };

  const handleSubmit = async (assignmentId, status) => {
    try {
      if (assignmentId) {
        const updated = await AssignmentsApi.update(assignmentId, { status_assignment: status });
        setAssignments(prev =>
          prev.map(a => (a.id === assignmentId ? { ...a, ...updated } : a))
        );
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

  // Filtrado para histórico
  const filteredAssignments = useMemo(() => {
    return assignments.filter(a => HISTORY_STATUSES.includes(a.status_assignment));
  }, [assignments]);

  const totalPages = Math.ceil(filteredAssignments.length / rowsPerPage);
  const paginatedAssignments = filteredAssignments.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <div className={`p-6 h-[calc(100vh-120px)] ${darkMode ? "bg-[#121212] text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      <h1 className="text-2xl font-semibold mb-4">Histórico de Asignaciones</h1>

      {/* Tabla con buscador y paginación */}
      <AssignmentTableFull
        assignments={paginatedAssignments}
        loading={loading}
        onEdit={handleEdit}
      />

      {/* Paginación */}
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {/* Diálogo de status */}
      <StatusFormDialog
        open={openDialog}
        assignment={editAssignment}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
