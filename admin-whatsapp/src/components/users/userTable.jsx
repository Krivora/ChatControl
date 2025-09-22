import { Edit, Delete } from "@mui/icons-material";
import { useTheme } from "../../context/ThemeContext";
export default function UsersTable({ users, loading, onEdit, onDelete }) {
  const { darkMode } = useTheme();
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
      <table className="w-full border-collapse text-left text-sm">
        {/* Cabecera */}
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
            <th className="px-6 py-3">Genero</th>
            <th className="px-6 py-3 text-right">Acciones</th>
          </tr>
        </thead>

        {/* Filas */}
        <tbody
          className={`divide-y ${
            darkMode ? "divide-gray-700 bg-[#1a1a1a]" : "divide-gray-200 bg-white"
          }`}
        >
          {users.map((u) => (
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
                {u.genero}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onDelete(u.id)} className={actionBtn}>
                    <Delete fontSize="small" />
                  </button>
                  <button onClick={() => onEdit(u.id)} className={actionBtn}>
                    <Edit fontSize="small" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
