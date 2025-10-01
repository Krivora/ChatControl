import { useState, useMemo } from "react";
import { Edit, Chat } from "@mui/icons-material";
import { useTheme } from "../../context/ThemeContext";
import TableFilters from "../common/TableFilters";
import Pagination from "../common/TablePagination";

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
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const formatPhone = (phone) => {
    if (!phone) return "-";
    const s = phone.toString();
    const local = s.startsWith("521") ? s.slice(3) : s;
    return `${local.slice(0,3)} ${local.slice(3,6)} ${local.slice(6)}`;
  };

  const filteredAssignments = useMemo(() => {
    return (assignments || []).filter(a => {
      const user = users.find(u => u.id === a.user_id)?.nombre || "";
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

  if (loading) return <div>Loading...</div>;
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
                <td className={darkMode ? "text-gray-300 px-6 py-4" : "text-gray-700 px-6 py-4"}>{a.customer_name || "Sin cliente"}</td>
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
