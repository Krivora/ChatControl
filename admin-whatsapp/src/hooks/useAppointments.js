import { useState, useEffect } from "react";
import { AppointmentsApi } from "../api";

export function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadAppointments = async (params = {}) => {
    setLoading(true);
    setError("");
    try {
      const res = await AppointmentsApi.list(params);
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando citas", err);
      setError(err.message || "Error al cargar citas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  return { appointments, loading, error, reload: loadAppointments };
}
