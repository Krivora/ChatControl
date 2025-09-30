import { useState, useMemo } from "react";
import { Edit, Chat } from "@mui/icons-material";
import { useTheme } from "../../context/ThemeContext";
import TableFilters from "../common/TableFilters";
import Pagination from "../common/TablePagination";
import { Skeleton } from "@mui/material";

export default function AssignmentTableFull({ assignments = [], loading, onEdit, onOpenChat }) {
  const { darkMode } = useTheme();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Función para formatear teléfono
const formatPhone = (phone) => {
  if (!phone) return "";
  const s = phone.toString();

  // Si empieza con '521', lo quitamos
  const local = s.startsWith("521") ? s.slice(3) : s;

  // Formateamos como "XXX XXX XXXX"
  return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
};



  const filteredAssignments = useMemo(() => {
    return (assignments || []).filter(a => {
      const status = a?.status_assignment || "";
      const user = a?.customer_name || "";
      const phone = a?.whatsapp_id || "";
      const fullData = `${status} ${user} ${phone}`.toLowerCase();
      return fullData.includes(search.toLowerCase());
    });
  }, [assignments, search]);

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
        {/* ... tabla skeleton igual que antes ... */}
      </div>
    );
  }

  if (!assignments.length) {
    return <div className={`p-4 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>No hay asignaciones aún.</div>;
  }

  return (
    <div className={`overflow-x-auto rounded-xl border shadow-sm ${darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"}`}>
      <TableFilters
        search={search}
        onSearchChange={val => { setSearch(val); setPage(1); }}
        rowsPerPage={rowsPerPage}
        onRowsChange={val => { setRowsPerPage(val); setPage(1); }}
        darkMode={darkMode}
        placeholder="Buscar asignación..."
      />
      <table className="w-full border-collapse text-left text-sm">
        <thead className={`text-xs font-semibold uppercase ${darkMode ? "bg-[#2a2a2a] text-gray-300" : "bg-gray-50 text-gray-500"}`}>
          <tr>
            <th className="px-6 py-3">Cliente</th>
            <th className="px-6 py-3">Teléfono</th>
            <th className="px-6 py-3">Estado</th>
            <th className="px-6 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${darkMode ? "divide-gray-700 bg-[#1a1a1a]" : "divide-gray-200 bg-white"}`}>
          {paginatedAssignments.map(a => (
            <tr key={a.id} className={`hover:${darkMode ? "bg-[#2a2a2a]" : "bg-gray-50"}`}>
              <td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{a.customer_name || "Sin cliente"}</td>
<td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
  {a.whatsapp_id ? formatPhone(a.whatsapp_id) : "-"}
</td>
              <td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{a.status_assignment || "-"}</td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onEdit(a)} className={actionBtn}><Edit fontSize="small" /></button>
                  <button onClick={() => onOpenChat(a)} className={actionBtn}><Chat fontSize="small" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
