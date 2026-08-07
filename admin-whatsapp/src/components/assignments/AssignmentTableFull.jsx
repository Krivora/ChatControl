import { useState, useMemo } from "react";
import { Edit, Chat, EditOutlined, Close, Check } from "@mui/icons-material";
import { useTheme } from "../../context/ThemeContext";
import { Skeleton } from "@mui/material";
import TableFilters from "../common/TableFilters";
import Pagination from "../common/TablePagination";
import { formatDateTime } from "../../utils/datetime";
import { CustomersApi } from "../../api/customers";
import { useAlert } from "../../utils/alert";
import {
  calculatePoints,
  getRange,
  initials,
  formatPhone,
  MAX_SCORE,
} from "../../utils/scoring";

// Colores por estado de la asignación
const STATUS_STYLES = {
  "En proceso": "bg-blue-100 text-blue-700",
  "Aprobado": "bg-green-100 text-green-700",
  "Aprobado No Concretado": "bg-amber-100 text-amber-700",
  "Vendido": "bg-emerald-100 text-emerald-700",
  "Rechazado": "bg-red-100 text-red-700",
  "Descartado": "bg-gray-200 text-gray-600",
};

const COLUMNS = ["Cliente", "Estado", "Score", "Asesor", "Asignado", ""];

export default function AssignmentTableFull({ assignments = [], users = [], loading, onEdit, onOpenChat }) {
  const { darkMode } = useTheme();
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
      showSnack("Nombre actualizado", "success");
    } catch (err) {
      console.error("Error al renombrar cliente:", err);
      showSnack(err.message || "No se pudo actualizar el nombre", "error");
    } finally {
      setSavingName(false);
    }
  };

  // 🔒 filtrado según rol
  const filteredAssignments = useMemo(() => {
    return (assignments || []).filter(a => {
      const asesor = (users || []).find(u => u.id === a.user_id)?.nombre || "";
      const status = a?.status_assignment || "";
      const customer = a?.customer_name || "";
      return `${status} ${customer} ${asesor}`.toLowerCase().includes(search.toLowerCase());
    });
  }, [assignments, search, users]);

  const totalPages = Math.ceil(filteredAssignments.length / rowsPerPage);
  const paginatedAssignments = filteredAssignments.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const shell = darkMode
    ? "rounded-2xl border border-gray-800 bg-[#1a1a1a] shadow-sm"
    : "rounded-2xl border border-gray-100 bg-white shadow-sm";

  const thead = darkMode
    ? "text-[11px] font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-800"
    : "text-[11px] font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100";

  const actionBtn = darkMode
    ? "w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-[#2a2a2a] hover:text-white transition-colors"
    : "w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-800 transition-colors";

  if (loading) {
    return (
      <div className={`overflow-x-auto ${shell}`}>
        {/* Skeleton móvil */}
        <div className="block md:hidden p-4 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton variant="circular" width={40} height={40} animation="wave" />
              <div className="flex-1">
                <Skeleton variant="text" width="60%" animation="wave" />
                <Skeleton variant="text" width="40%" animation="wave" />
              </div>
            </div>
          ))}
        </div>

        <table className="hidden md:table w-full border-collapse text-left text-sm">
          <thead className={thead}>
            <tr>
              {COLUMNS.map((h, i) => (
                <th key={i} className={`px-5 py-3 ${i === COLUMNS.length - 1 ? "text-right" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Skeleton variant="circular" width={36} height={36} animation="wave" />
                    <div className="flex-1">
                      <Skeleton variant="text" width={120} animation="wave" />
                      <Skeleton variant="text" width={90} animation="wave" />
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4"><Skeleton variant="text" width={90} animation="wave" /></td>
                <td className="px-5 py-4"><Skeleton variant="text" width={110} animation="wave" /></td>
                <td className="px-5 py-4"><Skeleton variant="text" width={100} animation="wave" /></td>
                <td className="px-5 py-4"><Skeleton variant="text" width={110} animation="wave" /></td>
                <td className="px-5 py-4 text-right">
                  <Skeleton variant="circular" width={28} height={28} animation="wave" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!assignments.length) {
    return (
      <div className={`${shell} p-10 text-center`}>
        <p className="text-sm text-gray-400">No hay asignaciones aún.</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${shell}`}>
      <TableFilters
        search={search}
        onSearchChange={val => { setSearch(val); setPage(1); }}
        rowsPerPage={rowsPerPage}
        onRowsChange={val => { setRowsPerPage(val); setPage(1); }}
        darkMode={darkMode}
        placeholder="Buscar asignación..."
      />

      {/* === Vista tabla (desktop) === */}
      <table className="hidden md:table w-full border-collapse text-left text-sm">
        <thead className={thead}>
          <tr>
            {COLUMNS.map((h, i) => (
              <th key={i} className={`px-5 py-3 ${i === COLUMNS.length - 1 ? "text-right" : ""}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className={darkMode ? "divide-y divide-gray-800" : "divide-y divide-gray-50"}>
          {paginatedAssignments.length === 0 && (
            <tr>
              <td colSpan={COLUMNS.length} className="px-5 py-10 text-center text-sm text-gray-400">
                Sin resultados para tu búsqueda
              </td>
            </tr>
          )}

          {paginatedAssignments.map(a => {
            const score = calculatePoints(a.answers || []);
            const range = getRange(score);
            const nombre = renamed[a.customer_id] ?? a.customer_name ?? "Sin cliente";
            const asesor = a.user_nombre ? `${a.user_nombre} ${a.user_apellido || ""}`.trim() : null;
            const enEdicion = editingId && editingId === a.customer_id;

            return (
              <tr
                key={a.id}
                className={`transition-colors ${darkMode ? "hover:bg-[#202020]" : "hover:bg-gray-50"}`}
              >
                {/* Cliente */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#960b2b] flex items-center justify-center text-white text-xs font-semibold">
                      {initials(nombre)}
                    </div>

                    <div className="min-w-0">
                      {enEdicion ? (
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
                            className={`w-36 rounded-lg px-2 py-1 text-sm outline-none border ${darkMode
                              ? "bg-[#2a2a2a] text-white border-gray-600"
                              : "bg-white text-gray-900 border-gray-300"}`}
                          />
                          <button
                            onClick={() => saveRename(a.customer_id)}
                            disabled={savingName}
                            title="Guardar"
                            className="p-1 rounded-lg bg-[#960b2b] text-white disabled:opacity-50"
                          >
                            <Check sx={{ fontSize: 16 }} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            disabled={savingName}
                            title="Cancelar"
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Close sx={{ fontSize: 16 }} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group">
                          <span className={`font-medium truncate ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                            {nombre}
                          </span>
                          {a.customer_id && (
                            <button
                              onClick={() => startRename(a)}
                              title="Cambiar nombre"
                              className="text-gray-400 hover:text-[#960b2b] opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <EditOutlined sx={{ fontSize: 16 }} />
                            </button>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-gray-400">{formatPhone(a.whatsapp_id)}</p>
                    </div>
                  </div>
                </td>

                {/* Estado */}
                <td className="px-5 py-4">
                  <span
                    className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
                      STATUS_STYLES[a.status_assignment] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {a.status_assignment || "Sin estado"}
                  </span>
                </td>

                {/* Score */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 min-w-[130px]">
                    <div className={`h-1.5 flex-1 rounded-full overflow-hidden ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                      <div
                        className={`h-full rounded-full ${range.bar}`}
                        style={{ width: `${Math.min(100, (score / MAX_SCORE) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap" title={range.label}>
                      {score} pts
                    </span>
                  </div>
                </td>

                {/* Asesor */}
                <td className="px-5 py-4">
                  {asesor ? (
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                        darkMode ? "bg-[#2a2a2a] text-gray-300" : "bg-gray-200 text-gray-600"
                      }`}>
                        {initials(asesor)}
                      </div>
                      <span className={`truncate ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        {asesor}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400">Sin asesor</span>
                  )}
                </td>

                {/* Asignado */}
                <td className={`px-5 py-4 whitespace-nowrap text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {formatDateTime(a.assigned_at, "-")}
                </td>

                {/* Acciones */}
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => onEdit(a)} title="Cambiar estado" className={actionBtn}>
                      <Edit fontSize="small" />
                    </button>
                    <button onClick={() => onOpenChat(a)} title="Abrir chat" className={actionBtn}>
                      <Chat fontSize="small" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* === Vista tarjetas (móvil) === */}
      <div className={`block md:hidden divide-y ${darkMode ? "divide-gray-800" : "divide-gray-50"}`}>
        {paginatedAssignments.length === 0 && (
          <p className="p-8 text-center text-sm text-gray-400">
            Sin resultados para tu búsqueda
          </p>
        )}

        {paginatedAssignments.map(a => {
          const score = calculatePoints(a.answers || []);
          const range = getRange(score);
          const nombre = renamed[a.customer_id] ?? a.customer_name ?? "Sin cliente";
          const asesor = a.user_nombre ? `${a.user_nombre} ${a.user_apellido || ""}`.trim() : null;
          const enEdicion = editingId && editingId === a.customer_id;

          return (
            <div key={a.id} className="p-4">
              {/* Cliente + estado */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#960b2b] flex items-center justify-center text-white text-xs font-semibold">
                  {initials(nombre)}
                </div>

                <div className="flex-1 min-w-0">
                  {enEdicion ? (
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
                        className={`flex-1 min-w-0 rounded-lg px-2 py-1 text-sm outline-none border ${darkMode
                          ? "bg-[#2a2a2a] text-white border-gray-600"
                          : "bg-white text-gray-900 border-gray-300"}`}
                      />
                      <button
                        onClick={() => saveRename(a.customer_id)}
                        disabled={savingName}
                        title="Guardar"
                        className="p-1 rounded-lg bg-[#960b2b] text-white disabled:opacity-50"
                      >
                        <Check sx={{ fontSize: 16 }} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        disabled={savingName}
                        title="Cancelar"
                        className="p-1 text-gray-400"
                      >
                        <Close sx={{ fontSize: 16 }} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={`font-medium truncate ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                        {nombre}
                      </span>
                      {a.customer_id && (
                        <button
                          onClick={() => startRename(a)}
                          title="Cambiar nombre"
                          className="text-gray-400 hover:text-[#960b2b]"
                        >
                          <EditOutlined sx={{ fontSize: 16 }} />
                        </button>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-400">{formatPhone(a.whatsapp_id)}</p>
                </div>

                <span
                  className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
                    STATUS_STYLES[a.status_assignment] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {a.status_assignment || "Sin estado"}
                </span>
              </div>

              {/* Score */}
              <div className="flex items-center gap-2 mt-3">
                <div className={`h-1.5 flex-1 rounded-full overflow-hidden ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                  <div
                    className={`h-full rounded-full ${range.bar}`}
                    style={{ width: `${Math.min(100, (score / MAX_SCORE) * 100)}%` }}
                  />
                </div>
                <span className="text-[11px] text-gray-400 flex-shrink-0" title={range.label}>
                  {score} pts
                </span>
              </div>

              {/* Asesor + fecha + acciones */}
              <div className="flex items-center justify-between gap-2 mt-3">
                <div className="min-w-0">
                  <p className={`text-sm truncate ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {asesor || "Sin asesor"}
                  </p>
                  <p className="text-[11px] text-gray-400">{formatDateTime(a.assigned_at, "-")}</p>
                </div>

                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => onEdit(a)} title="Cambiar estado" className={actionBtn}>
                    <Edit fontSize="small" />
                  </button>
                  <button onClick={() => onOpenChat(a)} title="Abrir chat" className={actionBtn}>
                    <Chat fontSize="small" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
