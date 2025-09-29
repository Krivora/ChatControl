import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import AssignmentTable from "../components/Assignment/AssignmentTable";
import { AssignmentsApi } from "../api/assignments";

export default function AssignmentPage() {
  const [assignments, setAssignments] = useState([]);
  const { darkMode } = useTheme();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const data = await AssignmentsApi.list();
        console.log("📌 Front: assignments obtenidos", data);
        setAssignments(data);
      } catch (err) {
        console.error("Error cargando asignaciones", err);
      }
    };
    fetchAssignments();
  }, []);

  return (
    <div className={`p-6 min-h-screen ${darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-black"}`}>
      <h1 className="text-2xl font-bold mb-6">Clientes Asignados</h1>
      <AssignmentTable assignments={assignments} darkMode={darkMode} />
    </div>
  );
}
