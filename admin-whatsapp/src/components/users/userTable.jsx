import { useState, useMemo } from "react";
import { Edit, Delete } from "@mui/icons-material";
import { useTheme } from "../../context/ThemeContext";
import { Skeleton } from "@mui/material";
import TableFilters from "../common/TableFilters";
import Pagination from "../common/TablePagination";

export default function UsersTable({ users, loading, onEdit, onDelete }) {
  const { darkMode } = useTheme();

  // 🔸 Estados
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 🔸 Filtrado
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const generoTexto =
        u.genero === "M" ? "masculino" : u.genero === "F" ? "femenino" : "otro";

      const fullData = `${u.nombre} ${u.apellido} ${u.email} ${u.telefono} ${generoTexto}`.toLowerCase();
      return fullData.includes(search.toLowerCase());
    });
  }, [users, search]);

  // 🔸 Paginación
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  if (loading) {
    return (
      <div
        className={`overflow-x-auto rounded-xl border shadow-sm ${
          darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"
        }`}
      >
        <table className="w-full border-collapse text-left text-sm">
          <thead
            className={`text-xs font-semibold uppercase ${
              darkMode ? "bg-[#2a2a2a] text-gray-300" : "bg-gray-50 text-gray-500"
            }`}
          >
            <tr>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Apellido</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Teléfono</th>
              <th className="px-6 py-3">Género</th>
              <th className="px-6 py-3">Rol</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-t">
                <td className="px-6 py-4">
                  <Skeleton variant="text" width={120} animation="wave" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton variant="text" width={100} animation="wave" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton variant="text" width={160} animation="wave" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton variant="text" width={120} animation="wave" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton variant="text" width={80} animation="wave" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton variant="text" width={80} animation="wave" />
                </td>
                <td className="px-6 py-4 text-right">
                  <Skeleton variant="circular" width={28} height={28} animation="wave" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className={`p-4 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
        No hay usuarios aún.
      </div>
    );
  }

  const actionBtn = darkMode
    ? "rounded-full p-1 text-gray-400 hover:bg-[#333333] hover:text-white"
    : "rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800";

  return (
    <div
      className={`overflow-x-auto rounded-xl border shadow-sm ${
        darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"
      }`}
    >
      {/* ✅ Filtros */}
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
        placeholder="Buscar usuario..."
      />

      {/* Tabla */}
      <table className="w-full border-collapse text-left text-sm">
        <thead
          className={`text-xs font-semibold uppercase ${
            darkMode ? "bg-[#2a2a2a] text-gray-300" : "bg-gray-50 text-gray-500"
          }`}
        >
          <tr>
            <th className="px-6 py-3">Nombre</th>
            <th className="px-6 py-3">Apellido</th>
            <th className="px-6 py-3">Email</th>
            <th className="px-6 py-3">Teléfono</th>
            <th className="px-6 py-3">Género</th>
            <th className="px-6 py-3">Rol</th>
            <th className="px-6 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody
          className={`divide-y ${
            darkMode ? "divide-gray-700 bg-[#1a1a1a]" : "divide-gray-200 bg-white"
          }`}
        >
          {paginatedUsers.map((u) => (
            <tr
              key={u.id}
              className={`hover:${darkMode ? "bg-[#2a2a2a]" : "bg-gray-50"}`}
            >
              <td
                className={`px-6 py-4 font-medium ${
                  darkMode ? "text-gray-100" : "text-gray-900"
                }`}
              >
                {u.nombre}
              </td>
              <td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                {u.apellido}
              </td>
              <td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                {u.email}
              </td>
              <td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                {u.telefono}
              </td>
              <td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                {u.genero === "M" ? "Masculino" : u.genero === "F" ? "Femenino" : "Otro"}
              </td>
              <td className={`px-6 py-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                {u.role_id === 1 ? "Super Administrador": u.role_id === 2 ? "Administrador": u.role_id === 3 ? "Usuario": "Sin Rol"} 
              </td>     
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onDelete(u.id)} className={actionBtn}>
                    <Delete fontSize="small" />
                  </button>
                  <button onClick={() => onEdit(u)} className={actionBtn}>
                    <Edit fontSize="small" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 📄 Paginación al fondo */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
}
