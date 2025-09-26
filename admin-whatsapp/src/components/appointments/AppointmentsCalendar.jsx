import { useRef, useState, useEffect, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useTheme } from "../../context/ThemeContext";
import { useAppointments } from "../../hooks/useAppointments";
import CalendarToolbar from "./CalendarToolbar";
import { Skeleton } from "@mui/material";

export default function AppointmentsCalendar() {
  const { darkMode } = useTheme();
  const { appointments, loading, error } = useAppointments();
  const calendarRef = useRef(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Escuchar cambios de tamaño
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔸 Mapear citas a eventos
  const events = useMemo(() => {
    return appointments.map((appt) => {
      const baseDate = new Date(appt.date);
      const dateStr = baseDate.toISOString().split("T")[0];
      const start = `${dateStr}T${appt.time_start}`;
      const end = `${dateStr}T${appt.time_end}`;
      return {
        id: appt.id,
        title: appt.customer_name,
        start,
        end,
        status: appt.status,
        note: `Tel: ${appt.whatsapp_id}`,
      };
    });
  }, [appointments]);

  // 🔸 Total de citas hoy
  const todayStr = new Date().toISOString().split("T")[0];
  const totalToday = appointments.filter(
    (appt) => appt.date.split("T")[0] === todayStr
  ).length;

  // 🔸 Navegación calendario
  const handlePrev = () => {
    const api = calendarRef.current?.getApi();
    api?.prev();
    setCurrentDate(api?.getDate());
  };

  const handleNext = () => {
    const api = calendarRef.current?.getApi();
    api?.next();
    setCurrentDate(api?.getDate());
  };

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
          <Skeleton variant="rectangular" height={40} />
          <Skeleton variant="rectangular" height={40} />
          <Skeleton variant="rectangular" height={40} />
          <Skeleton variant="rectangular" height={40} />
          <Skeleton variant="rectangular" height={40} />
        </div>
      ) : (
        <FullCalendar
          ref={calendarRef}
          plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
          initialView={isMobile ? "dayGridMonth" : "timeGridWeek"}
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
          dayHeaderFormat={{ weekday: "short", day: "numeric" }}
          dayHeaderContent={(arg) => (
            <div className="flex flex-col items-center py-1">
              <span
                className={`text-lg font-bold ${darkMode ? "text-gray-100" : "text-gray-900"
                  }`}
              >
                {arg.date.getDate()}
              </span>
              <span
                className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"
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
          eventContent={(arg) => {
            const { status, note } = arg.event.extendedProps;

            const getStyles = (s) => {
              if (!s)
                return {
                  border: "border-gray-400",
                  badge: "bg-gray-200 text-gray-600",
                };
              if (s.toLowerCase() === "confirmed") {
                return {
                  border: "border-green-500",
                  badge: darkMode
                    ? "bg-green-900/30 text-green-300"
                    : "bg-green-100 text-green-700",
                };
              }
              if (s.toLowerCase() === "cancelled") {
                return {
                  border: "border-red-500",
                  badge: darkMode
                    ? "bg-red-900/30 text-red-300"
                    : "bg-red-100 text-red-700",
                };
              }
              return {
                border: "border-blue-500",
                badge: darkMode
                  ? "bg-blue-900/30 text-blue-300"
                  : "bg-blue-100 text-blue-700",
              };
            };

            const styles = getStyles(status);

            return (
              <div
                className={`flex flex-col justify-between h-full px-2 py-2 text-xs rounded-lg shadow-sm border-l-4 ${styles.border} ${darkMode
                    ? "bg-[#2a2a2a] text-gray-100"
                    : "bg-white text-gray-900"
                  }`}
              >
                {!isMobile && (
                  <div
                    className={`text-[11px] font-medium ${darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                  >
                    {arg.timeText}
                  </div>
                )}
                <div className="font-semibold text-sm truncate">
                  {arg.event.title}
                </div>
                <div
                  className={`text-[11px] truncate ${darkMode ? "text-gray-300" : "text-gray-500"
                    }`}
                >
                  {note}
                </div>
                <div
                  className={`mt-1 inline-flex items-center justify-center rounded-md px-2 py-[2px] text-[11px] font-medium ${styles.badge}`}
                >
                  {status}
                </div>
              </div>
            );
          }}
        />
      )}
    </div>
  );
}
