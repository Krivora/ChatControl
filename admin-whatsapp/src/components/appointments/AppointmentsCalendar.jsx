import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useTheme } from "../../context/ThemeContext";
import { useAppointments } from "../../hooks/useAppointments";
import CalendarToolbar from "./CalendarToolbar";
import AppointmentForm from "./AppointmentForm";
import { AppointmentsApi } from "../../api/appointments";
import { useAlert } from "../../utils/alert";
import { Skeleton } from "@mui/material";

const CALENDAR_PLUGINS = [timeGridPlugin, dayGridPlugin, interactionPlugin];
const DAY_HEADER_FORMAT = { weekday: "short", day: "numeric" };

export default function AppointmentsCalendar() {
  const { darkMode } = useTheme();
  const { appointments, loading, error } = useAppointments();
  const calendarRef = useRef(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [editAppt, setEditAppt] = useState(null);
  const { showSnack } = useAlert();

  // 📱 Responsividad: detecta tamaño y cambia la vista del calendario
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // 👇 cambia automáticamente la vista si cambia el tamaño
      const api = calendarRef.current?.getApi();
      if (api) {
        const newView = mobile ? "timeGridDay" : "timeGridWeek";
        if (api.view.type !== newView) api.changeView(newView);
      }
    };

    handleResize(); // ejecutar una vez al montar
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleEventClick = useCallback(
    (info) => {
      const appt = appointments.find((a) => String(a.id) === String(info.event.id));
      if (appt) {
        setEditAppt(appt);
      }
    },
    [appointments]
  );


  const handleSave = useCallback(
  async (data) => {
    try {
      const updated = { ...editAppt, ...data };
      await AppointmentsApi.update(editAppt.id, updated);
      showSnack("Cita actualizada");
      setEditAppt(null);
      // Opcional: recargar citas si tienes función reload
    } catch {
      showSnack("Error al guardar cita", "error");
    }
  },
  [editAppt, showSnack]
);

  // 🎨 Colores por estado (dark/light)
  const STATUS_LABELS = useMemo(() => {
    const palette = {
      pending: "yellow",
      confirmed: "green",
      in_progress: "blue",
      completed: "gray",
      rescheduled: "purple",
      cancelled: "red",
      no_show: "orange",
    };

    const textMap = {
      pending: "Pendiente",
      confirmed: "Confirmada",
      in_progress: "En curso",
      completed: "Completada",
      rescheduled: "Reprogramada",
      cancelled: "Cancelada",
      no_show: "No asistió",
    };

    const labelMap = {};
    for (const [key, color] of Object.entries(palette)) {
      const classes = darkMode
        ? `bg-${color}-900/30 text-${color}-300 border-${color}-600`
        : `bg-${color}-100 text-${color}-700 border-${color}-400`;
      labelMap[key] = { text: textMap[key], classes };
    }
    return labelMap;
  }, [darkMode]);

  // 🔄 Crear eventos + contar citas del día
  const { events, totalToday } = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    let count = 0;

    const mapped = appointments.map((appt) => {
      const dateStr = new Date(appt.date).toISOString().split("T")[0];
      if (dateStr === todayStr) count++;
      return {
        id: appt.id,
        title: appt.customer_name,
        start: `${dateStr}T${appt.time_start}`,
        end: `${dateStr}T${appt.time_end}`,
        status: appt.status,
        note: `Tel: ${appt.whatsapp_id}`,
      };
    });

    return { events: mapped, totalToday: count };
  }, [appointments]);

  // 🔸 Navegación del calendario
  const handlePrev = useCallback(() => {
    const api = calendarRef.current?.getApi();
    api?.prev();
    setCurrentDate(api?.getDate());
  }, []);

  const handleNext = useCallback(() => {
    const api = calendarRef.current?.getApi();
    api?.next();
    setCurrentDate(api?.getDate());
  }, []);

  // 🧩 Render de eventos
  const EventContent = useCallback(
    ({ event, timeText }) => {
      const { status, note } = event.extendedProps;
      const label = STATUS_LABELS[status?.toLowerCase()] || STATUS_LABELS.pending;

      return (
        <div
          className={`flex flex-col justify-between h-full px-2 py-2 text-xs rounded-lg shadow-sm border-l-4 ${label.classes} ${
            darkMode ? "bg-[#2a2a2a] text-gray-100" : "bg-white text-gray-900"
          }`}
        >
          {!isMobile && (
            <div
              className={`text-[11px] font-medium ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {timeText}
            </div>
          )}
          <div className="font-semibold text-sm truncate">{event.title}</div>
          <div
            className={`text-[11px] truncate ${
              darkMode ? "text-gray-300" : "text-gray-500"
            }`}
          >
            {note}
          </div>
          <div className="mt-1 inline-flex items-center justify-center gap-1 rounded-md px-2 py-[2px] text-[11px] font-medium">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                label.classes.match(/text-(\w+)-/)
                  ? `bg-${label.classes.match(/text-(\w+)-/)[1]}-500`
                  : "bg-gray-400"
              }`}
            ></span>
            {label.text}
          </div>
        </div>
      );
    },
    [darkMode, isMobile, STATUS_LABELS]
  );

  // === Render principal ===
  return (
    <div
      className={`overflow-x-auto rounded-xl border shadow-sm ${
        darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"
      }`}
    >
      {error && <p className="p-2 text-red-500 text-sm">{error}</p>}

      <CalendarToolbar
        currentDate={currentDate}
        onPrev={handlePrev}
        onNext={handleNext}
        totalToday={totalToday}
      />

      {loading ? (
        <div className="space-y-3 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={40} />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="p-6 text-center text-sm text-gray-500">
          No hay citas registradas aún
        </div>
      ) : (
        <FullCalendar
          ref={calendarRef}
          plugins={CALENDAR_PLUGINS}
          initialView={isMobile ? "timeGridDay" : "timeGridWeek"} // 👈 esta línea controla la vista
          allDaySlot={false}
          slotDuration="01:00:00"
          slotLabelInterval="01:00"
          slotMinTime="09:00:00"
          slotMaxTime="18:00:00"
          expandRows={true}
          headerToolbar={false}
          events={events}
          nowIndicator={true}
          height={isMobile ? "auto" : "66vh"}
          firstDay={1}
          hiddenDays={[0]}
          dayHeaderFormat={DAY_HEADER_FORMAT}
          dayHeaderContent={(arg) => (
            <div className="flex flex-col items-center py-1">
              <span
                className={`text-lg font-bold ${
                  darkMode ? "text-gray-100" : "text-gray-900"
                }`}
              >
                {arg.date.getDate()}
              </span>
              <span
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {arg.date.toLocaleDateString("es-MX", { weekday: "short" })}
              </span>
            </div>
          )}
          slotLabelClassNames={() =>
            `text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`
          }
          dayCellClassNames={() =>
            `${darkMode ? "border border-gray-700" : "border border-gray-200"}`
          }
          eventClassNames={() => "bg-transparent border-0 shadow-none p-0"}
          eventClick={handleEventClick}
          eventContent={(arg) => (
            <EventContent event={arg.event} timeText={arg.timeText} />
          )}
        />
      )}
      <AppointmentForm
        open={!!editAppt}
        onClose={() => setEditAppt(null)}
        onSave={handleSave}
        initialData={editAppt}
      />
    </div>
  );
}
