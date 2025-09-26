import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import AssignmentTable from "../components/Assignment/AssignmentTable";

export default function AssignmentPage() {
  const [assignments, setAssignments] = useState([]);
  const { darkMode } = useTheme();

  // Traer clientes asignados desde la API
  const fetchAssignments = async () => {
    try {
      const res = await fetch("/api/clients-assigned"); // 👉 Ajusta la ruta a tu API
      const data = await res.json();
      setAssignments(data); // data debería venir con: id, customer_name, answers, etc.
    } catch (err) {
      console.error("Error cargando asignaciones", err);
    }
  };

  const updateAssignment = async (id, ponderacion) => {
    try {
      await fetch(`/api/assignments/${id}`, {
        method: "PATCH", // o PUT según tu API
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ponderacion }),
      });

      // Actualizar localmente
      setAssignments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ponderacion } : a))
      );
    } catch (err) {
      console.error("Error actualizando ponderación", err);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  return (
    <div
      className={`p-6 min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-[#1f1f1f] text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <h1 className="text-2xl font-bold mb-6">Clientes Asignados</h1>
      <AssignmentTable
        assignments={assignments}
        onUpdatePonderacion={updateAssignment}
        darkMode={darkMode}
      />
    </div>
  );
}
