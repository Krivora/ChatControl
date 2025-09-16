// src/components/messages/AppointmentScheduler.jsx
import { useState } from "react";
import { useAvailableSlots } from "../../hooks/useAvailableSlots";
import { useAppointment } from "../../hooks/useAppointment";

function addMinutesToTime(hms = "00:00:00", minutes = 30) {
  const [h, m, s = "00"] = hms.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}:${String(s ?? 0).padStart(2, "0")}`;
}

export default function AppointmentScheduler({ conversationId }) {
  const [date, setDate] = useState("");
  const { slots, loading: loadingSlots, error: slotsError, fetchSlots, setSlots } =
    useAvailableSlots();
  const { createAppointment, loading: loadingCreate, error: createError } =
    useAppointment();

  const onDateChange = (e) => {
    const newDate = e.target.value;
    setDate(newDate);
    if (newDate) fetchSlots(newDate);
  };

  const onSelectSlot = async (slotTime) => {
    if (!date) return;
    const timeStart = slotTime;
    const timeEnd = addMinutesToTime(slotTime, 30);

    const { ok } = await createAppointment(conversationId, date, timeStart, timeEnd);
    if (ok) {
      // feedback rápido
      window?.toast?.success?.("Cita agendada ✅") || alert("✅ Cita agendada correctamente");
      // refrescar la lista de slots para que desaparezca el que se tomó
      fetchSlots(date);
    }
  };

  const showGrid = Boolean(date) && !loadingSlots && !slotsError;

  return (
    <div className="p-4 border rounded-md bg-white shadow-sm">
      <h2 className="font-semibold text-lg mb-3">Agendar cita</h2>

      <label className="block text-sm text-gray-600 mb-1">Fecha</label>
      <input
        type="date"
        value={date}
        onChange={onDateChange}
        className="border px-2 py-1 rounded mb-3 w-full"
      />

      {!date && <p className="text-sm text-gray-500">Selecciona una fecha para ver horarios.</p>}

      {loadingSlots && <p className="text-sm text-gray-500">Cargando horarios…</p>}
      {slotsError && (
        <p className="text-sm text-red-600">Error al cargar horarios: {slotsError}</p>
      )}

      {showGrid && (
        <>
          {slots.length === 0 ? (
            <p className="text-sm text-gray-500">No hay horarios disponibles para ese día.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {slots.map((s) => (
                <button
                  key={s.slot_time}
                  onClick={() => onSelectSlot(s.slot_time)}
                  disabled={loadingCreate}
                  className="border rounded px-2 py-2 hover:bg-green-50 transition disabled:opacity-60"
                  title="Agendar en este horario"
                >
                  🕒 {s.slot_time}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {createError && (
        <p className="text-sm text-red-600 mt-3">No se pudo agendar: {createError}</p>
      )}

      {/* Botón para limpiar (opcional) */}
      {slots.length > 0 && (
        <button
          onClick={() => {
            setSlots([]);
            setDate("");
          }}
          className="mt-4 text-xs text-gray-500 underline"
        >
          Limpiar selección
        </button>
      )}
    </div>
  );
}
