// src/hooks/useAppointment.js
import { useState } from "react";
import { createAppointment as createAppointmentApi } from "../api";

export function useAppointment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createAppointment = async (conversationId, date, timeStart, timeEnd) => {
    setError("");
    setLoading(true);
    try {
      const res = await createAppointmentApi({
        conversationId,
        date,
        timeStart,
        timeEnd,
      });
      return { ok: true, data: res };
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al agendar cita");
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { createAppointment, loading, error };
}
