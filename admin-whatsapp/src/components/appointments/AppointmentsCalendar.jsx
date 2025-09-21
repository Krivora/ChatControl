import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useTheme } from "../../context/ThemeContext";

export default function AppointmentsCalendar() {
  const { darkMode } = useTheme();

  const events = [
    {
      title: "Tony Hack",
      start: "2025-09-15T09:00:00",
      end: "2025-09-15T10:00:00",
      status: "Completed",
      note: "General Check-up",
    },
    {
      title: "Jamie Urlic",
      start: "2025-09-17T10:00:00",
      end: "2025-09-17T11:00:00",
      status: "Cancelled",
      note: "Follow-up Consultation",
    },
  ];

  return (
    <div
      className={`p-4 rounded-xl shadow ${
        darkMode ? "bg-[#1f1f1f] text-gray-100" : "bg-white text-gray-900"
      }`}
    >
      <FullCalendar
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        allDaySlot={false}
        slotDuration="01:00:00"
        slotLabelInterval="01:00"
        slotMinTime="09:00:00"
        slotMaxTime="18:00:00"
        expandRows={true}
        headerToolbar={false}
        events={events}
        nowIndicator={true}
        height="66vh"
        firstDay={1}
        hiddenDays={[0]}
        dayHeaderFormat={{ weekday: "short", day: "numeric" }}
        dayHeaderContent={(arg) => (
          <div className="flex flex-col items-center py-1">
            <span className={`text-lg font-bold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
              {arg.date.getDate()}
            </span>
            <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              {arg.date.toLocaleDateString("en-US", { weekday: "short" })}
            </span>
          </div>
        )}
        /* Etiquetas de hora (eje Y) */
        slotLabelClassNames={() => `text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
        /* Bordes de la grilla */
        dayCellClassNames={() => `${darkMode ? "border border-gray-200" : "border border-gray-200"}`}
        /* Quitar fondo azul nativo de los eventos */
        eventClassNames={() => "bg-transparent border-0 shadow-none p-0"}
        eventContent={(arg) => {
          const { status, note } = arg.event.extendedProps;

          // 🎨 Colores por estado (borde + badge) con variantes dark
          const getStyles = (s) => {
            if (s === "Completed") {
              return {
                border: "border-green-500",
                badge: darkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-700",
              };
            }
            if (s === "Cancelled") {
              return {
                border: "border-red-500",
                badge: darkMode ? "bg-red-900/30 text-red-300" : "bg-red-100 text-red-700",
              };
            }
            // Pending por default
            return {
              border: "border-blue-500",
              badge: darkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-700",
            };
          };

          const styles = getStyles(status);

          return (
            <div
              className={`flex flex-col justify-between h-full px-2 py-2 text-xs rounded-lg shadow-sm border-l-4 ${styles.border} ${
                darkMode ? "bg-[#2a2a2a] text-gray-100" : "bg-white text-gray-900"
              }`}
            >
              {/* Hora */}
              <div className={`text-[11px] font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                {arg.timeText}
              </div>

              {/* Nombre */}
              <div className="font-semibold text-sm truncate">
                {arg.event.title}
              </div>

              {/* Descripción */}
              <div className={`text-[11px] truncate ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                {note}
              </div>

              {/* Estado */}
              <div
                className={`mt-1 inline-flex items-center justify-center rounded-md px-2 py-[2px] text-[11px] font-medium ${styles.badge}`}
              >
                {status === "Pending" ? "Pending" : status}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
