import { useState, useMemo, useCallback, memo } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAppointments } from "../../hooks/useAppointments";
import { AppointmentsApi } from "../../api/appointments";
import AppointmentForm from "./AppointmentForm";
import { useAlert } from "../../utils/alert";
import { Skeleton } from "@mui/material";
import TableFilters from "../common/TableFilters";
import Pagination from "../common/TablePagination";
import AppointmentRow from "./AppointmentRow";
import AppointmentCard from "./AppointmentCard";
import { useDebounce } from "../../hooks/useDebounce";


// 🎨 Etiquetas de estados
const STATUS_LABELS = {
  pending: { text: "Pendiente", classes: "bg-yellow-100 text-yellow-700" },
  confirmed: { text: "Confirmada", classes: "bg-green-100 text-green-700" },
  in_progress: { text: "En curso", classes: "bg-blue-100 text-blue-700" },
  completed: { text: "Completada", classes: "bg-gray-100 text-gray-700" },
  rescheduled: { text: "Reprogramada", classes: "bg-purple-100 text-purple-700" },
  cancelled: { text: "Cancelada", classes: "bg-red-100 text-red-700" },
  no_show: { text: "No asistió", classes: "bg-orange-100 text-orange-700" },
};

const ACTIVE_STATUSES = ["pending", "confirmed", "in_progress", "rescheduled"];
const HISTORY_STATUSES = ["completed", "cancelled", "no_show"];

export default function AppointmentsList() {
  const { showConfirm, showSnack } = useAlert();
  const { darkMode } = useTheme();

  const [editAppt, setEditAppt] = useState(null);
  const [activeTab, setActiveTab] = useState("active");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 🔗 Filtros que viajan al backend. Orden descendente en ambas pestañas:
  // la cita más nueva primero.
  const query = useMemo(
    () => ({
      page,
      pageSize: rowsPerPage,
      statuses: (activeTab === "active" ? ACTIVE_STATUSES : HISTORY_STATUSES).join(","),
      q: debouncedSearch || undefined,
      order: "desc",
    }),
    [page, rowsPerPage, activeTab, debouncedSearch]
  );

  const { appointments, setAppointments, meta, loading, error, reload } =
    useAppointments(query);

  // 🎨 Estilos
  const styles = useMemo(
    () => ({
      container: darkMode
        ? "rounded-2xl border border-gray-800 bg-[#1a1a1a] shadow-sm"
        : "rounded-2xl border border-gray-100 bg-white shadow-sm",
      thead: darkMode
        ? "text-[11px] font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-800"
        : "text-[11px] font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100",
      tbody: darkMode
        ? "divide-y divide-gray-800"
        : "divide-y divide-gray-50",
      rowHover: darkMode ? "hover:bg-[#202020]" : "hover:bg-gray-50",
      textBase: darkMode ? "text-gray-300" : "text-gray-700",
      textStrong: darkMode ? "text-gray-100" : "text-gray-900",
      textMuted: darkMode ? "text-gray-400" : "text-gray-500",
      actionBtn: darkMode
        ? "w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-[#2a2a2a] hover:text-white transition-colors"
        : "w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-800 transition-colors",
    }),
    [darkMode]
  );

  // 📊 Contadores de pestañas: vienen del servidor sobre el total real,
  // no sobre la página que se está viendo.
  const sumCounts = (list) =>
    list.reduce((n, status) => n + (meta.counts?.[status] || 0), 0);
  const activeCount = sumCounts(ACTIVE_STATUSES);
  const historyCount = sumCounts(HISTORY_STATUSES);

  const totalPages = Math.max(1, Math.ceil(meta.total / rowsPerPage));

  // --- Acciones genéricas ---
  const updateStatus = useCallback(
    (appt, newStatus, actionText) => {
      showConfirm({
        title: `${actionText} cita`,
        text: `¿Seguro que quieres ${actionText.toLowerCase()} la cita de ${appt.customer_name}?`,
        icon: "question",
        confirmText: `Sí, ${actionText}`,
        cancelText: "No",
      }).then(async (res) => {
        if (!res.isConfirmed) return;
        try {
          await AppointmentsApi.update(appt.id, { ...appt, status: newStatus });
          showSnack(`Cita ${actionText.toLowerCase()} con éxito`);
          reload();
        } catch {
          showSnack(`Error al ${actionText.toLowerCase()} la cita`, "error");
        }
      });
    },
    [showConfirm, showSnack, reload]
  );

  const handleCancel = useCallback(
    (a) => updateStatus(a, "cancelled", "Cancelar"),
    [updateStatus]
  );
  const handleConfirm = useCallback(
    (a) => updateStatus(a, "confirmed", "Confirmar"),
    [updateStatus]
  );
  const handleComplete = useCallback(
    (a) => updateStatus(a, "completed", "Completar"),
    [updateStatus]
  );

  const handleSave = useCallback(
    async (data) => {
      try {
        const updated = { ...editAppt, ...data };
        await AppointmentsApi.update(editAppt.id, updated);
        showSnack("Cita actualizada");
        setEditAppt(null);
        // Actualiza solo el evento editado en el estado local
        setAppointments((prev) =>
          prev.map((appt) =>
            appt.id === updated.id ? { ...appt, ...updated } : appt
          )
        );
      } catch {
        showSnack("Error al guardar cita", "error");
      }
    },
    [editAppt, showSnack, setAppointments]
  );

  // === Render ===
  return (
    <div>
      {/* 🧭 Tabs con contadores */}
      <div
        className={`inline-flex gap-1 p-1 rounded-xl mb-4 ${
          darkMode ? "bg-[#1a1a1a] border border-gray-800" : "bg-gray-200/60"
        }`}
      >
        {[
          { id: "active", label: "Citas activas", count: activeCount },
          { id: "history", label: "Historial", count: historyCount },
        ].map((tab) => {
          const isTabActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isTabActive
                  ? darkMode
                    ? "bg-[#2a1119] text-white shadow-sm"
                    : "bg-white text-[#960b2b] shadow-sm"
                  : darkMode
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                  isTabActive
                    ? "bg-[#960b2b] text-white"
                    : darkMode
                    ? "bg-[#2a2a2a] text-gray-400"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className={`overflow-x-auto ${styles.container}`}>
      {error && <p className="p-4 text-sm text-red-500">{error}</p>}

      {/* 🔍 Filtros */}
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
        placeholder="Buscar cita..."
      />

      {/* === Vista Tabla (desktop) === */}
      <table className="hidden w-full border-collapse text-left text-sm md:table">
        <thead className={styles.thead}>
          <tr>
            {["Fecha", "Hora", "Cliente", "Estado", ""].map((h, i) => (
              <th
                key={i}
                className={`px-5 py-3 ${i === 4 ? "text-right" : ""}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className={styles.tbody}>
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <tr key={i}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Skeleton variant="rounded" width={44} height={44} animation="wave" />
                    <div className="flex-1">
                      <Skeleton variant="text" width={90} animation="wave" />
                      <Skeleton variant="text" width={110} animation="wave" />
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <Skeleton variant="text" width={110} animation="wave" />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Skeleton variant="circular" width={36} height={36} animation="wave" />
                    <div className="flex-1">
                      <Skeleton variant="text" width={100} animation="wave" />
                      <Skeleton variant="text" width={80} animation="wave" />
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <Skeleton variant="rounded" width={80} height={24} animation="wave" />
                </td>
                <td className="px-5 py-4 text-right">
                  <Skeleton variant="circular" width={28} height={28} animation="wave" />
                </td>
              </tr>
            ))}

          {!loading && appointments.length === 0 && (
            <tr>
              <td
                colSpan="5"
                className="px-5 py-12 text-center text-sm text-gray-400"
              >
                No hay citas {activeTab === "active" ? "activas" : "en historial"}
              </td>
            </tr>
          )}


          {!loading &&
            appointments.map((appt) => (
              <MemoAppointmentRow
                key={appt.id}
                appt={appt}
                statusLabels={STATUS_LABELS}
                {...styles}
                onEdit={setEditAppt}
                onCancel={handleCancel}
                onConfirm={handleConfirm}
                onComplete={handleComplete}
              />
            ))}
        </tbody>
      </table>

      {/* === Vista Móvil (cards) === */}
      <div className={`block md:hidden divide-y ${darkMode ? "divide-gray-800" : "divide-gray-50"}`}>
        {!loading && appointments.length === 0 && (
          <p className="p-8 text-center text-sm text-gray-400">
            No hay citas {activeTab === "active" ? "activas" : "en historial"}
          </p>
        )}

        {!loading &&
          appointments.map((appt) => (
            <MemoAppointmentCard
              key={appt.id}
              appt={appt}
              statusLabels={STATUS_LABELS}
              {...styles}
              onEdit={setEditAppt}
              onCancel={handleCancel}
              onConfirm={handleConfirm}
            />
          ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <AppointmentForm
        open={!!editAppt}
        onClose={() => setEditAppt(null)}
        onSave={handleSave}
        initialData={editAppt}
      />
    </div>
  );
}

// 🧠 Memo para rendimiento
const MemoAppointmentRow = memo(AppointmentRow);
const MemoAppointmentCard = memo(AppointmentCard);

