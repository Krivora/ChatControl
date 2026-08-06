import { useState, useMemo } from "react";
import { Edit, Chat } from "@mui/icons-material";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext"; // 👈 import
import { Skeleton } from "@mui/material";
import TableFilters from "../common/TableFilters";
import Pagination from "../common/TablePagination";
import { formatDateTime } from "../../utils/datetime";
import { CustomersApi } from "../../api/customers";
import { useAlert } from "../../utils/alert";

// Mapeos de puntos
const ponderacionMap = {
  down_payment_max: [
    { label: "$30,000 – $50,000", points: 15 },
    { label: "$50,000 – $70,000", points: 15 },
    { label: "$70,000 – $100,000", points: 20 },
    { label: "$100,000 – $200,000", points: 25 },
    { label: "$200,000 o más", points: 25 },
  ],
  max_monthly_payment: [
    { label: "$4,000 – $5,500", points: 25 },
    { label: "$5,500 – $7,000", points: 25 },
    { label: "$7,000 – $9,000", points: 25 },
    { label: "$9,000 o más", points: 25 },
  ],
  credit_bureau_status: [
    { label: "mal", points: 5 },
    { label: "regular", points: 15 },
    { label: "bien", points: 30 },
    { label: "excelente", points: 50 },
  ],
  time_to_buy: [
    { label: "Ya estoy listo", points: 70 },
    { label: "De 1 a 15 días", points: 15 },
    { label: "De 15 a 30 días", points: 10 },
    { label: "Más de 30 días", points: 5 },
  ],
};

// Rangos de puntaje con color
const scoreRanges = [
  { min: 0, max: 50, color: "bg-red-500" },
  { min: 51, max: 100, color: "bg-yellow-400" },
  { min: 101, max: 140, color: "bg-green-400" },
  { min: 141, max: 170, color: "bg-blue-500" },
];

export default function AssignmentTableFull({ assignments = [], users = [], loading, onEdit, onOpenChat }) {
  const { darkMode } = useTheme();
  const { user } = useAuth(); // 👈 usuario loggeado
  const { showSnack } = useAlert();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Edición del nombre del cliente desde la tabla
  const [editingId, setEditingId] = useState(null);   // customer_id en edición
  const [nameDraft, setNameDraft] = useState("");
  const [savingName, setSavingName] = useState(false);
  // Nombres ya guardados, para pintarlos sin esperar la siguiente recarga
  const [renamed, setRenamed] = useState({});

  const startRename = (a) => {
    setEditingId(a.customer_id);
    setNameDraft(renamed[a.customer_id] ?? a.customer_name ?? "");
  };

  const saveRename = async (customerId) => {
    const nuevo = nameDraft.trim();
    if (!nuevo) {
      showSnack("El nombre no puede estar vacío", "warning");
      return;
    }

    setSavingName(true);
    try {
      const res = await CustomersApi.rename(customerId, nuevo);
      setRenamed((prev) => ({ ...prev, [customerId]: res?.data?.full_name || nuevo }));
      setEditingId(null);
      showSnack("Nombre actualizado ✅", "success");
    } catch (err) {
      console.error("Error al renombrar cliente:", err);
      showSnack(err.message || "No se pudo actualizar el nombre ❌", "error");
    } finally {
      setSavingName(false);
    }
  };

  const formatPhone = (phone) => {
    if (!phone) return "-";
    const s = phone.toString();
    const local = s.startsWith("521") ? s.slice(3) : s;
    return `${local.slice(0,3)} ${local.slice(3,6)} ${local.slice(6)}`;
  };

  // 🔒 filtrado según rol
  const filteredAssignments = useMemo(() => {
    return (assignments || []).filter(a => {
      const user = (users || []).find(u => u.id === a.user_id)?.nombre || "";
      const status = a?.status_assignment || "";
      const customer = a?.customer_name || "";
      return `${status} ${customer} ${user}`.toLowerCase().includes(search.toLowerCase());
    });
  }, [assignments, search, users]);

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
              <th className="px-6 py-3">Cliente</th>
              <th className="px-6 py-3">Teléfono</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3">Score</th>
              <th className="px-6 py-3">Asesor</th>
              <th className="px-6 py-3">Fecha Creada</th>
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
                  <Skeleton variant="text" width={110} animation="wave" />
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
  if (!assignments.length) return <div>No hay asignaciones aún.</div>;

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
            <th className="px-6 py-3">Score</th>
            <th className="px-6 py-3">Asesor</th>
            <th className="px-6 py-3">Fecha Creada</th>
            <th className="px-6 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${darkMode ? "divide-gray-700 bg-[#1a1a1a]" : "divide-gray-200 bg-white"}`}>
          {paginatedAssignments.map(a => {
            const answersDelAssignment = a.answers || [];
            const score = answersDelAssignment.reduce((sum, ans) => {
              const options = ponderacionMap[ans.question_key] || [];
              const matched = options.find(opt => opt.label.toLowerCase() === ans.answer_value?.toLowerCase());
              return sum + (matched?.points || 0);
            }, 0);
            const range = scoreRanges.find(r => score >= r.min && score <= r.max) || {};
            const user = users.find(u => u.id === a.user_id);

            return (
              <tr key={a.id} className={`hover:${darkMode ? "bg-[#2a2a2a]" : "bg-gray-50"}`}>
                <td className={darkMode ? "text-gray-300 px-6 py-4" : "text-gray-700 px-6 py-4"}>
                  {editingId && editingId === a.customer_id ? (
                    <div className="flex items-center gap-1">
                      <input
                        autoFocus
                        value={nameDraft}
                        onChange={(e) => setNameDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveRename(a.customer_id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        disabled={savingName}
                        className={`w-36 rounded px-2 py-1 text-sm outline-none border ${darkMode
                          ? "bg-[#2a2a2a] text-white border-gray-600"
                          : "bg-white text-gray-900 border-gray-300"}`}
                      />
                      <button
                        onClick={() => saveRename(a.customer_id)}
                        disabled={savingName}
                        className="text-xs px-2 py-1 rounded bg-[#960b2b] text-white disabled:opacity-50"
                      >
                        {savingName ? "..." : "OK"}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        disabled={savingName}
                        className="text-xs px-1 text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <span>{renamed[a.customer_id] ?? a.customer_name ?? "Sin cliente"}</span>
                      {a.customer_id && (
                        <button
                          onClick={() => startRename(a)}
                          title="Cambiar nombre"
                          className="text-xs text-gray-400 hover:text-[#960b2b] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✏️
                        </button>
                      )}
                    </div>
                  )}
                </td>
                <td className={darkMode ? "text-gray-300 px-6 py-4" : "text-gray-700 px-6 py-4"}>{formatPhone(a.whatsapp_id)}</td>
                <td className={darkMode ? "text-gray-300 px-6 py-4" : "text-gray-600 px-6 py-4"}>{a.status_assignment || "-"}</td>
                <td className={darkMode ? "text-gray-300 px-6 py-4" : "text-gray-600 px-6 py-4"}>
                  <div className="flex items-center gap-x-2">
                    <span>{score} / 170 pts</span>
                    <div
                      className={`w-4 h-4 rounded-full ${range.color}`}
                      title={range.label}
                    ></div>
                  </div>
                </td>

                <td className={darkMode ? "text-gray-300 px-6 py-4" : "text-gray-700 px-6 py-4"}>{a.user_nombre ? `${a.user_nombre} ${a.user_apellido}` : "-"}</td>
                <td className={`whitespace-nowrap ${darkMode ? "text-gray-300 px-6 py-4" : "text-gray-600 px-6 py-4"}`}>
                  {formatDateTime(a.assigned_at, "-")}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => onEdit(a)} className={actionBtn}><Edit fontSize="small" /></button>
                    <button onClick={() => onOpenChat(a)} className={actionBtn}><Chat fontSize="small" /></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
