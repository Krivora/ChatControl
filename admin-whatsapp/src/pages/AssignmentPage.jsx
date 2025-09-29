// AssignmentPage.jsx
import { useState, useEffect } from "react";
import { Add, Edit, Delete } from "@mui/icons-material";
import { useTheme } from "../context/ThemeContext";
import AssignmentTableFull from "../components/assignments/AssignmentTableFull";
import StatusFormDialog from "../components/assignments/StatusFormDialog";
import { AssignmentsApi } from "../api/assignments";
import { useAlert } from "../utils/alert";

export default function AssignmentPage() {
  const { darkMode } = useTheme();
  const { showSnack, showConfirm } = useAlert();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editAssignment, setEditAssignment] = useState(null);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const data = await AssignmentsApi.list();
      const filtered = data.filter(a => !a.status || a.status !== "Rechazado");
      setAssignments(filtered);
    } catch (err) {
      console.error("Error cargando asignaciones", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleCreate = () => {
    setEditAssignment(null);
    setOpenDialog(true);
  };

  const handleEdit = (assignment) => {
    setEditAssignment(assignment);
    setOpenDialog(true);
  };
useEffect(() => {
  if (!openDialog) {
    document.activeElement?.blur();
  }
}, [openDialog]);

  const handleDelete = async (id) => {
    const result = await showConfirm({
      title: "¿Eliminar asignación?",
      text: "Esta acción no se puede deshacer",
      confirmText: "Sí, eliminar",
      cancelText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await AssignmentsApi.delete(id);
        setAssignments(prev => prev.filter(a => a.id !== id));
        showSnack("Asignación eliminada", "success");
      } catch (e) {
        showSnack("No se pudo eliminar la asignación", "error");
      }
    }
  };

  const handleSubmit = async (assignmentId, status) => {
    try {
      if (assignmentId) {
        // Actualizar asignación
        const updatedAssignment = await AssignmentsApi.update(assignmentId, { status_assignment: status });

        // Actualizar la tabla sin romper la estructura
        setAssignments(prev =>
          prev.map(a => (a.id === assignmentId ? { ...a, ...updatedAssignment } : a))
        );

        showSnack("Asignación actualizada", "success");
      } else {
        // Crear asignación: recuerda pasar los datos necesarios
        const newAssignment = await AssignmentsApi.create({ conversation_id: 1, user_id: 1, status: "active" });

        setAssignments(prev => [newAssignment, ...prev]);
        showSnack("Asignación creada", "success");
      }

      setOpenDialog(false);
    } catch (e) {
      showSnack(e.message || "Error al guardar", "error");
    }
  };



  return (
    <div
      className={`p-6 h-[calc(100vh-120px)] ${
        darkMode ? "bg-[#121212] text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Asignaciones</h1>
      </div>

      <AssignmentTableFull
        assignments={assignments}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <StatusFormDialog
        open={openDialog}
        assignment={editAssignment}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
//jala