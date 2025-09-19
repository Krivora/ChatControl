// src/hooks/useAppointments.js
import { useState, useEffect } from "react";
import { getAppointments } from "../api";

export function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAppointments();
      setAppointments(data);
    } catch (err) {
      console.error("Error cargando citas", err);
      setError(err.message || "Error al cargar citas");
    } finally {
      setLoading(false);
    }
  };

  // Cargar automáticamente al montar el componente
  useEffect(() => {
    loadAppointments();
  }, []);

  return { appointments, loading, error, reload: loadAppointments };
}
