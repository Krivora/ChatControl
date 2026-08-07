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
import { toISODate } from "../../utils/datetime";

const CALENDAR_PLUGINS = [timeGridPlugin, dayGridPlugin, interactionPlugin];
const DAY_HEADER_FORMAT = { weekday: "short", day: "numeric" };

// Clases estáticas: Tailwind no puede detectar nombres construidos con
// plantillas (`bg-${color}-100`), así que esas clases nunca se generaban y
// los eventos salían sin color.
const STATUS_STYLES = {
  pending:     { text: "Pendiente",    dot: "bg-yellow-500", border: "border-l-yellow-400", chip: "bg-yellow-100 text-yellow-700" },
  confirmed:   { text: "Confirmada",   dot: "bg-green-500",  border: "border-l-green-500",  chip: "bg-green-100 text-green-700" },
  in_progress: { text: "En curso",     dot: "bg-blue-500",   border: "border-l-blue-500",   chip: "bg-blue-100 text-blue-700" },
  completed:   { text: "Completada",   dot: "bg-gray-400",   border: "border-l-gray-400",   chip: "bg-gray-100 text-gray-600" },
  rescheduled: { text: "Reprogramada", dot: "bg-purple-500", border: "border-l-purple-500", chip: "bg-purple-100 text-purple-700" },
  cancelled:   { text: "Cancelada",    dot: "bg-red-500",    border: "border-l-red-500",    chip: "bg-red-100 text-red-700" },
  no_show:     { text: "No asistió",   dot: "bg-orange-500", border: "border-l-orange-500", chip: "bg-orange-100 text-orange-700" },
};

export default function AppointmentsCalendar() {
  const { darkMode } = useTheme();
  const calendarRef = useRef(null);

  const [currentDate, setCurrentDate] = useState(new Date());

  // Solo se piden las citas alrededor del mes visible: sin filtros, el
  // backend devolvía las 20 más antiguas y el calendario salía vacío.
  const query = useMemo(() => {
    const d = currentDate || new Date();
    return {
      dateFrom: toISODate(new Date(d.getFullYear(), d.getMonth() - 1, 1)),
      dateTo: toISODate(new Date(d.getFullYear(), d.getMonth() + 2, 0)),
      order: "asc",
      pageSize: 100,
    };
  }, [currentDate]);

  const { appointments, setAppointments, loading, error } = useAppointments(query);

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

  // 🔄 Crear eventos + contar citas del día
  const { events, totalToday } = useMemo(() => {
    const todayStr = toISODate(new Date());
    let count = 0;

    const mapped = appointments.map((appt) => {
      const dateStr = toISODate(appt.date);
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
      const style = STATUS_STYLES[status?.toLowerCase()] || STATUS_STYLES.pending;

      return (
        <div
          className={`flex flex-col h-full overflow-hidden px-2.5 py-1.5 text-xs rounded-lg shadow-sm border-l-4 ${style.border} ${
            darkMode
              ? "bg-[#242424] text-gray-100"
              : "bg-white text-gray-900 border-y border-r border-gray-100"
          }`}
        >
          {!isMobile && (
            <div className="text-[10px] font-medium text-gray-400">{timeText}</div>
          )}

          <div className="font-semibold text-[13px] truncate">{event.title}</div>

          <div className="text-[10px] truncate text-gray-400">{note}</div>

          <div
            className={`mt-auto self-start inline-flex items-center gap-1 rounded-full px-1.5 py-[1px] text-[10px] font-medium ${style.chip}`}
          >
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {style.text}
          </div>
        </div>
      );
    },
    [darkMode, isMobile]
  );

  // === Render principal ===
  return (
    <div
      className={`overflow-x-auto rounded-2xl border shadow-sm ${
        darkMode ? "border-gray-800 bg-[#1a1a1a]" : "border-gray-100 bg-white"
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
        <div className="space-y-2 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={44} animation="wave" />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-sm text-gray-400">No hay citas en estas fechas</p>
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
