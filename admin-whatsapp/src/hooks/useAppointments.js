import { useState, useEffect, useRef } from "react";
import { AppointmentsApi } from "../api";

export function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const firstLoad = useRef(true);

  const loadAppointments = async (params = {}) => {
    try {
      if (firstLoad.current) setLoading(true);
      const res = await AppointmentsApi.list(params);
      const newData = Array.isArray(res.data) ? res.data : [];

      setAppointments((prev) => {
        const prevMap = new Map(prev.map((a) => [a.id, a]));
        const merged = [];

        for (const a of newData) {
          const existing = prevMap.get(a.id);
          if (!existing) {
            // 🆕 nueva cita detectada
            merged.push({ ...a, _new: true });
          } else {
            // 🔄 actualizada o igual
            merged.push(
              JSON.stringify(existing) === JSON.stringify(a)
                ? existing // igual, no re-renderiza
                : { ...a, _updated: true } // modificada
            );
          }
          prevMap.delete(a.id);
        }

        // Si quieres manejar eliminadas (por si acaso)
        // const deletedIds = Array.from(prevMap.keys());

        return merged;
      });
    } catch (err) {
      console.error("Error cargando citas", err);
      setError(err.message || "Error al cargar citas");
    } finally {
      if (firstLoad.current) {
        setLoading(false);
        firstLoad.current = false;
      }
    }
  };

  // 🔁 auto-recarga cada 10s (sin parpadeo)
  useEffect(() => {
    loadAppointments();
    const interval = setInterval(loadAppointments, 10000);
    return () => clearInterval(interval);
  }, []);

  // ⏳ limpia flags de animación (_new y _updated)
  useEffect(() => {
    if (appointments.some((a) => a._new || a._updated)) {
      const timer = setTimeout(() => {
        setAppointments((prev) =>
          prev.map(({ _new, _updated, ...rest }) => rest)
        );
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [appointments]);

  return {
    appointments,
    setAppointments, // 🔹 lo mantenemos para actualizar manualmente desde fuera
    loading,
    error,
    reload: loadAppointments, // para forzar recarga si lo necesitas
  };
}
