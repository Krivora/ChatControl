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
  const { appointments, loading, error, reload } = useAppointments();
  const { showConfirm, showSnack } = useAlert();
  const { darkMode } = useTheme();

  const [editAppt, setEditAppt] = useState(null);
  const [activeTab, setActiveTab] = useState("active");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 🎨 Estilos
  const styles = useMemo(
    () => ({
      container: darkMode
        ? "rounded-xl border border-gray-700 bg-[#1e1e1e] shadow-sm"
        : "rounded-xl border border-gray-200 bg-white shadow-sm",
      thead: darkMode
        ? "bg-[#2a2a2a] text-xs font-semibold text-gray-300 uppercase"
        : "bg-gray-50 text-xs font-semibold text-gray-500 uppercase",
      tbody: darkMode
        ? "divide-y divide-gray-700 bg-[#1e1e1e]"
        : "divide-y divide-gray-200 bg-white",
      rowHover: darkMode ? "hover:bg-[#2a2a2a]" : "hover:bg-gray-50",
      textBase: darkMode ? "text-gray-300" : "text-gray-700",
      textStrong: darkMode ? "text-gray-100" : "text-gray-900",
      textMuted: darkMode ? "text-gray-400" : "text-gray-600",
      actionBtn: darkMode
        ? "rounded-full p-1 text-gray-400 hover:bg-[#333333] hover:text-white"
        : "rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800",
    }),
    [darkMode]
  );

  // 📊 Calcular contadores de citas activas / historial
  const { activeCount, historyCount } = useMemo(() => {
    let active = 0;
    let history = 0;
    appointments.forEach((appt) => {
      if (ACTIVE_STATUSES.includes(appt.status)) active++;
      if (HISTORY_STATUSES.includes(appt.status)) history++;
    });
    return { activeCount: active, historyCount: history };
  }, [appointments]);

  // 🔍 Filtrado y paginación optimizados
  const paginatedAppointments = useMemo(() => {
    const filtered = appointments.filter((appt) => {
      const text = `${appt.customer_name} ${appt.whatsapp_id} ${appt.status}`.toLowerCase();
      const matchesSearch = text.includes(debouncedSearch.toLowerCase());
      const inTab =
        activeTab === "active"
          ? ACTIVE_STATUSES.includes(appt.status)
          : HISTORY_STATUSES.includes(appt.status);
      return matchesSearch && inTab;
    });

    const start = (page - 1) * rowsPerPage;
    return {
      total: filtered.length,
      data: filtered.slice(start, start + rowsPerPage),
    };
  }, [appointments, debouncedSearch, page, rowsPerPage, activeTab]);

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
        reload();
      } catch {
        showSnack("Error al guardar cita", "error");
      }
    },
    [editAppt, reload, showSnack]
  );

  // === Render ===
  return (
    <div className={`overflow-x-auto ${styles.container}`}>
      {error && <p className="p-4 text-sm text-red-500">{error}</p>}

      {/* 🧭 Tabs con contadores */}
      <div className="flex border-b mb-2">
        <button
          onClick={() => {
            setActiveTab("active");
            setPage(1);
          }}
          className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
            activeTab === "active"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Citas activas
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === "active"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {activeCount}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("history");
            setPage(1);
          }}
          className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
            activeTab === "history"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Historial
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === "history"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {historyCount}
          </span>
        </button>
      </div>

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
            {["Fecha", "Hora", "Cliente", "Teléfono", "Status", "Acciones"].map(
              (h) => (
                <th
                  key={h}
                  className={`px-6 py-3 ${
                    h === "Acciones" ? "text-right" : ""
                  }`}
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>

        <tbody className={styles.tbody}>
          {loading &&
            Array.from({ length: 3 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <td key={j} className="px-6 py-4">
                    <Skeleton width={100} height={20} />
                  </td>
                ))}
              </tr>
            ))}

          {!loading && paginatedAppointments.data.length === 0 && (
            <tr>
              <td
                colSpan="6"
                className="px-6 py-4 text-center text-sm text-gray-500"
              >
                No hay citas {activeTab === "active" ? "activas" : "en historial"}
              </td>
            </tr>
          )}

          {!loading &&
            paginatedAppointments.data.map((appt) => (
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
      <div className="block divide-y divide-gray-200 md:hidden">
        {!loading && paginatedAppointments.data.length === 0 && (
          <p className="p-4 text-center text-sm text-gray-500">
            No hay citas {activeTab === "active" ? "activas" : "en historial"}
          </p>
        )}

        {!loading &&
          paginatedAppointments.data.map((appt) => (
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

      <Pagination
        page={page}
        totalPages={Math.ceil(
          paginatedAppointments.total / rowsPerPage || 1
        )}
        onChange={setPage}
      />

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

