// src/pages/AppointmentsPage.jsx
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";
import { getAppointments, createAppointment } from "../api/appointments";

export default function AppointmentsPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await getAppointments();
      const mapped = data.map((a) => ({
        id: a.id,
        title: `Cita con #${a.conversation_id}`,
        start: `${a.date}T${a.time_start}`,
        end: `${a.date}T${a.time_end}`,
        backgroundColor: a.status === "confirmed" ? "#22c55e" : "#facc15",
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

  return (
    <div className="p-1">
      <h1 className="text-2xl font-bold mb-4">📅 Citas</h1>

      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable={true}
        selectMirror={true}
        allDaySlot={false}
        slotDuration="00:30:00"
        events={events}
        select={handleSelectSlot}
        height="80vh"
        locale="es"
      />
    </div>
  );
}
