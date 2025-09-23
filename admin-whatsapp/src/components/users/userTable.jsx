import { useState, useMemo } from "react";
import { Edit, Delete,Search } from "@mui/icons-material";
import { useTheme } from "../../context/ThemeContext";
import Pagination from "./Pagination";

export default function UsersTable({ users, loading, onEdit, onDelete }) {
  const { darkMode } = useTheme();

  // 🔸 Estados
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 🔸 Filtrado
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // transformar el genero
      const generoTexto =
        u.genero === "M" ? "masculino" : u.genero === "F" ? "femenino" : "otro";

      // concatenar todo en un string searchable
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
      <div className={`p-4 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
        Cargando usuarios...
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
      {/* 🔍 Filtro */}
      <div className="p-3 flex flex-col sm:flex-row justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <Search
            fontSize="small"
            className={`absolute left-3 top-1/2 -translate-y-1/2 
              ${darkMode ? "text-gray-400" : "text-gray-500"}`}
          />
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className={`pl-10 pr-3 py-2 rounded-lg text-sm w-full 
              ${darkMode
                ? "bg-[#2a2a2a] text-gray-200 placeholder-gray-500"
                : "bg-gray-100 text-gray-700 placeholder-gray-400"
              }`}
          />
        </div>

        {/* Selector filas */}
        <select
          value={rowsPerPage}
          onChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setPage(1);
          }}
          className={`px-2 py-2 rounded-lg text-sm ${
            darkMode
              ? "bg-[#2a2a2a] text-gray-200"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          <option value={5}>5 por página</option>
          <option value={10}>10 por página</option>
          <option value={20}>20 por página</option>
          <option value={50}>50 por página</option>
        </select>
      </div>

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
              <td className={`px-6 py-4 font-medium ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
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

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={(newPage) => setPage(newPage)}
      />

    </div>
  );
}
