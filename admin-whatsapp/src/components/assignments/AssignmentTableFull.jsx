// AssignmentTableFull.jsx
import { useState, useMemo } from "react";
import { Edit } from "@mui/icons-material";
import { useTheme } from "../../context/ThemeContext";
import TableFilters from "../common/TableFilters";
import Pagination from "../common/TablePagination";
import { Skeleton } from "@mui/material";

export default function AssignmentTableFull({ assignments = [], loading, onEdit }) {
  const { darkMode } = useTheme();

  // 🔸 Estados
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 🔸 Filtrado
  const filteredAssignments = useMemo(() => {
    return (assignments || []).filter(a => {
      const status = a?.status_assignment || "";
      const user = a?.customer_name || "";
      const conv = a?.conversation_id || "";
      const fullData = `${status} ${user} ${conv}`.toLowerCase();
      return fullData.includes(search.toLowerCase());
    });
  }, [assignments, search]);


  // 🔸 Paginación
  const totalPages = Math.ceil(filteredAssignments.length / rowsPerPage);
  const paginatedAssignments = filteredAssignments.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const actionBtn = darkMode
    ? "rounded-full p-1 text-gray-400 hover:bg-[#333333] hover:text-white"
    : "rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800";

  if (loading) {
    return (
      <div className={`overflow-x-auto rounded-xl border shadow-sm ${darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"}`}>
        <table className="w-full border-collapse text-left text-sm">
          <thead className={`text-xs font-semibold uppercase ${darkMode ? "bg-[#2a2a2a] text-gray-300" : "bg-gray-50 text-gray-500"}`}>
            <tr>
              <th className="px-6 py-3">Conversación</th>
              <th className="px-6 py-3">Cliente</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-t">
                <td className="px-6 py-4"><Skeleton variant="text" width={100} animation="wave" /></td>
                <td className="px-6 py-4"><Skeleton variant="text" width={160} animation="wave" /></td>
                <td className="px-6 py-4"><Skeleton variant="text" width={80} animation="wave" /></td>
                <td className="px-6 py-4 text-right"><Skeleton variant="circular" width={28} height={28} animation="wave" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!assignments || assignments.length === 0) {
    return (
      <div className={`p-4 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
        No hay asignaciones aún.
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-xl border shadow-sm ${darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"}`}>
      {/* ✅ Filtros */}
      <TableFilters
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        rowsPerPage={rowsPerPage}
        onRowsChange={(val) => { setRowsPerPage(val); setPage(1); }}
        darkMode={darkMode}
        placeholder="Buscar asignación..."
      />

      {/* Tabla */}
      <table className="w-full border-collapse text-left text-sm">
        <thead className={`text-xs font-semibold uppercase ${darkMode ? "bg-[#2a2a2a] text-gray-300" : "bg-gray-50 text-gray-500"}`}>
          <tr>
            <th className="px-6 py-3">Conversación</th>
            <th className="px-6 py-3">Cliente</th>
            <th className="px-6 py-3">Estado</th>
            <th className="px-6 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${darkMode ? "divide-gray-700 bg-[#1a1a1a]" : "divide-gray-200 bg-white"}`}>
          {paginatedAssignments.map(a => (
            <tr key={a.id} className={`hover:${darkMode ? "bg-[#2a2a2a]" : "bg-gray-50"}`}>
              <td className={`px-6 py-4 font-medium ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                {a.conversation_id || "-"}
              </td>
              <td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                {a.customer_name || "Sin cliente"}
              </td>
              <td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                {a?.status_assignment || "-"}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onEdit(a)} className={actionBtn}><Edit fontSize="small" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 📄 Paginación al fondo */}
      <Pagination page={page} totalPages={totalPages} onChange={(newPage) => setPage(newPage)} />
    </div>
  );
}
