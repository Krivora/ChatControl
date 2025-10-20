import { useState, useMemo } from "react";
import { Edit, Delete } from "@mui/icons-material";
import { Skeleton } from "@mui/material";
import { useTheme } from "../../context/ThemeContext";
import TableFilters from "../common/TableFilters";
import Pagination from "../common/TablePagination";

export default function ContentTable({ contents, loading, onEdit, onDelete }) {
  const { darkMode } = useTheme();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 🔍 Filtrado
  const filtered = useMemo(() => {
    return contents.filter((c) =>
      `${c.name} ${c.content}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [contents, search]);

  // 📄 Paginación
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const actionBtn = darkMode
    ? "rounded-full p-1 text-gray-400 hover:bg-[#333333] hover:text-white"
    : "rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800";

  if (loading) {
    return (
      <div className={`rounded-xl border ${darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"}`}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 border-b">
            <Skeleton variant="text" width={200} animation="wave" />
            <Skeleton variant="text" width="90%" animation="wave" />
          </div>
        ))}
      </div>
    );
  }

  if (!contents.length) {
    return (
      <div className={`p-4 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
        No hay registros aún.
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-xl border shadow-sm ${darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"}`}>
      <TableFilters
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        rowsPerPage={rowsPerPage}
        onRowsChange={(val) => {
          setRowsPerPage(val);
          setPage(1);
        }}
        darkMode={darkMode}
        placeholder="Buscar contenido..."
      />

      <table className="w-full border-collapse text-left text-sm">
        <thead
          className={`text-xs font-semibold uppercase ${
            darkMode ? "bg-[#2a2a2a] text-gray-300" : "bg-gray-50 text-gray-500"
          }`}
        >
          <tr>
            <th className="px-6 py-3">Nombre</th>
            <th className="px-6 py-3">Contenido</th>
            <th className="px-6 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody
          className={`divide-y ${
            darkMode ? "divide-gray-700 bg-[#1a1a1a]" : "divide-gray-200 bg-white"
          }`}
        >
          {paginated.map((c) => (
            <tr
              key={c.id}
              className={`hover:${darkMode ? "bg-[#2a2a2a]" : "bg-gray-50"}`}
            >
              <td className="px-6 py-4 font-medium">{c.name}</td>
              <td className="px-6 py-4 whitespace-pre-line">{c.content}</td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onEdit(c)} className={actionBtn}>
                    <Edit fontSize="small" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
}
