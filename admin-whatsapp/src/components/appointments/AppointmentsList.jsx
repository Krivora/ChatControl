import { useState, useMemo } from "react";
import { Edit, FreeCancellation } from "@mui/icons-material";
import { useTheme } from "../../context/ThemeContext";
import { useAppointments } from "../../hooks/useAppointments";
import { formatDayAndDate, formatTime } from "../../utils/dateUtils";
import { formatPhone } from "../../utils/phoneUtils";
import { AppointmentsApi } from "../../api/appointments";
import AppointmentForm from "./AppointmentForm";
import { useAlert } from "../../utils/alert";
import { Skeleton } from "@mui/material";
import TableFilters from "../common/TableFilters";
import Pagination from "../common/TablePagination";

export default function AppointmentsList() {
  const { appointments, loading, error, reload } = useAppointments();
  const { showConfirm, showSnack } = useAlert();
  const [editAppt, setEditAppt] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const { darkMode } = useTheme();

  // 🔸 Estados de filtros y paginación
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 🔸 Filtrado
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      const fullData = `${appt.customer_name} ${appt.whatsapp_id} ${appt.status}`.toLowerCase();
      return fullData.includes(search.toLowerCase());
    });
  }, [appointments, search]);

  // 🔸 Paginación
  const totalPages = Math.ceil(filteredAppointments.length / rowsPerPage);
  const paginatedAppointments = filteredAppointments.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const statusLabels = {
    confirmed: { text: "Confirmada", classes: "bg-green-100 text-green-700" },
    pending: { text: "Pendiente", classes: "bg-blue-100 text-blue-700" },
    cancelled: { text: "Cancelada", classes: "bg-red-100 text-red-700" },
  };

  const container = darkMode
    ? "rounded-xl border border-gray-700 bg-[#1e1e1e] shadow-sm"
    : "rounded-xl border border-gray-200 bg-white shadow-sm";

  const thead = darkMode
    ? "bg-[#2a2a2a] text-xs font-semibold text-gray-300 uppercase"
    : "bg-gray-50 text-xs font-semibold text-gray-500 uppercase";

  const tbody = darkMode
    ? "divide-y divide-gray-700 bg-[#1e1e1e]"
    : "divide-y divide-gray-200 bg-white";

  const rowHover = darkMode ? "hover:bg-[#2a2a2a]" : "hover:bg-gray-50";
  const textBase = darkMode ? "text-gray-300" : "text-gray-700";
  const textStrong = darkMode ? "text-gray-100" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-600";
  const actionBtn = darkMode
    ? "rounded-full p-1 text-gray-400 hover:bg-[#333333] hover:text-white"
    : "rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800";

  const handleCancel = (appt) => {
    showConfirm({
      title: "Cancelar cita",
      text: `¿Seguro que quieres cancelar la cita de ${appt.customer_name}?`,
      confirmText: "Sí, cancelar",
      cancelText: "No",
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await AppointmentsApi.cancel(appt.id);
          showSnack("Cita cancelada");
          reload();
        } catch {
          showSnack("Error al cancelar", "error");
        }
      }
    });
  };

  const handleSave = async (data) => {
    try {
      await AppointmentsApi.update(editAppt.id, data);
      showSnack("Cita actualizada");
      setEditAppt(null);
      reload();
    } catch {
      showSnack("Error al guardar cita", "error");
    }
  };

  return (
    <div className={`overflow-x-auto ${container}`}>
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
        <thead className={thead}>
          <tr>
            <th className="px-6 py-3">Fecha</th>
            <th className="px-6 py-3">Hora</th>
            <th className="px-6 py-3">Cliente</th>
            <th className="px-6 py-3">Teléfono</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3 text-right">Acciones</th>
          </tr>
        </thead>

        <tbody className={tbody}>
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

          {!loading && paginatedAppointments.length === 0 && (
            <tr>
              <td colSpan="6" className="px-6 py-4 text-center text-muted">
                No hay citas registradas
              </td>
            </tr>
          )}

          {!loading &&
            paginatedAppointments.map((appt) => {
              const statusInfo =
                statusLabels[appt.status?.toLowerCase()] ||
                { text: appt.status, classes: "bg-gray-100 text-gray-500" };

              const { dayName, fullDate } = formatDayAndDate(appt.date);

              return (
                <tr key={appt.id} className={rowHover}>
                  <td className={`px-6 py-4 font-medium ${textBase}`}>
                    <div className="flex flex-col">
                      <span className="capitalize font-semibold">{dayName}</span>
                      <span className="text-xs text-gray-500">{fullDate}</span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 font-medium ${textBase}`}>
                    {formatTime(appt.date, appt.time_start)} –{" "}
                    {formatTime(appt.date, appt.time_end)}
                  </td>
                  <td className={`px-6 py-4 font-medium ${textStrong}`}>
                    {appt.customer_name}
                  </td>
                  <td className={`px-6 py-4 font-medium ${textMuted}`}>
                    {formatPhone(appt.whatsapp_id)}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${statusInfo.classes}`}
                    >
                      <span className="h-2 w-2 rounded-full bg-current"></span>
                      {statusInfo.text}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className={actionBtn}
                        onClick={() => handleCancel(appt)}
                      >
                        <FreeCancellation fontSize="small" />
                      </button>
                      <button
                        className={actionBtn}
                        onClick={() => setEditAppt(appt)}
                      >
                        <Edit fontSize="small" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

      {/* === Vista Móvil (cards) === */}
      <div className="block divide-y divide-gray-200 md:hidden">
        {!loading && paginatedAppointments.length === 0 && (
          <p className="p-4 text-center text-sm text-muted">
            No hay citas registradas
          </p>
        )}

        {!loading &&
          paginatedAppointments.map((appt) => {
            const statusInfo =
              statusLabels[appt.status?.toLowerCase()] ||
              { text: appt.status, classes: "bg-gray-100 text-gray-500" };

            const { dayName, fullDate } = formatDayAndDate(appt.date);

            return (
              <div
                key={appt.id}
                className={`flex flex-col gap-2 p-4 ${rowHover}`}
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold capitalize">{dayName}</p>
                    <p className="text-xs text-gray-500">{fullDate}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusInfo.classes}`}
                  >
                    {statusInfo.text}
                  </span>
                </div>
                <p className={`${textBase}`}>
                  {formatTime(appt.date, appt.time_start)} –{" "}
                  {formatTime(appt.date, appt.time_end)}
                </p>
                <p className={textStrong}>{appt.customer_name}</p>
                <p className={textMuted}>{formatPhone(appt.whatsapp_id)}</p>

                <div className="flex justify-end gap-2">
                  <button
                    className={actionBtn}
                    onClick={() => handleCancel(appt)}
                  >
                    <FreeCancellation fontSize="small" />
                  </button>
                  <button
                    className={actionBtn}
                    onClick={() => setEditAppt(appt)}
                  >
                    <Edit fontSize="small" />
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* 📄 Paginación al fondo */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={(newPage) => setPage(newPage)}
      />

      {/* Formularios */}
      <AppointmentForm
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSave={handleSave}
        initialData={null}
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
