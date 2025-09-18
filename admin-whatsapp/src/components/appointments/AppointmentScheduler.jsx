// src/components/appointments/AppointmentScheduler.jsx
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState, useRef } from "react";
import { getAppointments, createAppointment } from "../../api/appointments";

export default function AppointmentScheduler({ darkMode }) {
  const [events, setEvents] = useState([]);
  const [activeView, setActiveView] = useState("timeGridDay"); // vista seleccionada
  const calendarRef = useRef(null);

  useEffect(() => {
    loadAppointments();
  }, [darkMode]);

  const loadAppointments = async () => {
    try {
      const data = await getAppointments();
      const mapped = data.map((a) => ({
        id: a.id,
        title: `Cita: #${a.conversation_id}`,
        start: `${a.date}T${a.time_start}`,
        end: `${a.date}T${a.time_end}`,
        backgroundColor:
          a.status === "confirmed"
            ? darkMode
              ? "#16a34a"
              : "#22c55e"
            : a.status === "pending"
            ? darkMode
              ? "#f59e0b"
              : "#facc15"
            : "#ef4444",
        extendedProps: { status: a.status },
      }));
      setEvents(mapped);
    } catch (err) {
      console.error("Error cargando citas", err);
    }
  };

  const handleSelectSlot = async (info) => {
    const date = info.startStr.split("T")[0];
    const timeStart = info.startStr.split("T")[1];
    const timeEnd = info.endStr.split("T")[1];

    const conversationId = prompt("ID de la conversación del cliente:");
    if (!conversationId) return;

    await createAppointment({ conversationId, date, timeStart, timeEnd });
    await loadAppointments();
    alert("✅ Cita agendada");
  };

  const changeView = (newView) => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.changeView(newView);
    setActiveView(newView);
  };

  const buttonClass = (viewName) =>
    `px-3 py-1 rounded ${
      activeView === viewName
        ? "bg-[#960b2b] text-white hover:bg-[#7d0923]" // rojo si activo
        : darkMode
        ? "bg-gray-700 text-white hover:bg-gray-600"
        : "bg-gray-300 text-gray-900 hover:bg-gray-400"
    }`;

  return (
    <div
      className={`flex flex-col md:flex-row gap-4 p-4 ${
        darkMode ? "bg-[#1f1f1f] text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Calendario */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-2">
          <h1
            className={`text-2xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            📅 Citas
          </h1>
          <div className="flex gap-2">
            <button
              className={buttonClass("timeGridDay")}
              onClick={() => changeView("timeGridDay")}
            >
              Hoy
            </button>
            <button
              className={buttonClass("timeGridWeek")}
              onClick={() => changeView("timeGridWeek")}
            >
              Semana
            </button>
          </div>
        </div>

        <FullCalendar
          ref={calendarRef}
          plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
          initialView={activeView}
          selectable
          selectMirror
          allDaySlot={false}
          slotDuration="00:30:00"
          events={events}
          select={handleSelectSlot}
          height="75vh" // controla altura y evita scroll
          locale="es"
          headerToolbar={{
            left: "",
            center: "",
            right: "prev,next", // flechas a la derecha
          }}
          dayHeaderClassNames={darkMode ? ["text-white"] : ["text-gray-900"]}
          slotLabelClassNames={darkMode ? ["text-gray-300"] : ["text-gray-700"]}
          dayCellClassNames={
            darkMode ? ["bg-[#1f1f1f] border-gray-600"] : ["bg-white border-gray-200"]
          }
          eventContent={(arg) => (
            <div
              className={`flex flex-col p-1 rounded ${
                darkMode ? "text-white" : "text-black"
              }`}
            >
              <span className="font-semibold">{arg.event.title}</span>
              <span className="text-xs">{arg.event.extendedProps.status}</span>
            </div>
          )}
          nowIndicator
        />
      </div>

      {/* Próximas citas */}
      <div
        className={`w-full md:w-1/3 p-4 rounded shadow ${
          darkMode ? "bg-[#1f1f1f]" : "bg-gray-50"
        }`}
      >
        <h2
          className={`font-semibold text-lg mb-2 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Próximas citas
        </h2>
        {events.length === 0 && (
          <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
            No hay citas próximas
          </p>
        )}
        <ul>
          {events
            .filter((e) => new Date(e.start) >= new Date())
            .sort((a, b) => new Date(a.start) - new Date(b.start))
            .slice(0, 5)
            .map((e) => (
              <li
                key={e.id}
                className={`flex justify-between mb-2 p-2 rounded ${
                  darkMode
                    ? "hover:bg-[#2a2a2a] text-white"
                    : "hover:bg-gray-200 text-gray-900"
                }`}
              >
                <span>{e.title}</span>
                <span className="text-sm opacity-70">
                  {new Date(e.start).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
