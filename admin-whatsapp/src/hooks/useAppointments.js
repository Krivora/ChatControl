import { useState, useEffect, useRef, useCallback } from "react";
import { AppointmentsApi } from "../api";

export function useAppointments(query = {}) {
  const [appointments, setAppointments] = useState([]);
  const [meta, setMeta] = useState({ total: 0, counts: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const firstLoad = useRef(true);

  // La query se serializa para poder usarla como dependencia estable:
  // un objeto nuevo en cada render dispararía el efecto infinitamente.
  const queryKey = JSON.stringify(query);
  const prevKey = useRef(queryKey);

  const loadAppointments = useCallback(async () => {
    try {
      if (firstLoad.current) setLoading(true);
      const res = await AppointmentsApi.list(JSON.parse(queryKey));
      const newData = Array.isArray(res.data) ? res.data : [];

      // Si cambió la página o el filtro, el set entero es distinto y no
      // tiene sentido marcarlo como "nuevo": sería un parpadeo completo.
      const sameQuery = prevKey.current === queryKey;
      prevKey.current = queryKey;

      setMeta({
        total: res.meta?.total ?? newData.length,
        counts: res.meta?.counts ?? {},
      });

      setAppointments((prev) => {
        if (!sameQuery) return newData;

        const prevMap = new Map(prev.map((a) => [a.id, a]));
        return newData.map((a) => {
          const existing = prevMap.get(a.id);
          if (!existing) return { ...a, _new: true };
          return JSON.stringify(existing) === JSON.stringify(a)
            ? existing
            : { ...a, _updated: true };
        });
      });

      setError("");
    } catch (err) {
      console.error("Error cargando citas", err);
      setError(err.message || "Error al cargar citas");
    } finally {
      if (firstLoad.current) {
        setLoading(false);
        firstLoad.current = false;
      }
    }
  }, [queryKey]);

  // 🔁 auto-recarga cada 10s (sin parpadeo)
  useEffect(() => {
    loadAppointments();
    const interval = setInterval(loadAppointments, 10000);
    return () => clearInterval(interval);
  }, [loadAppointments]);

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
    meta,
    loading,
    error,
    reload: loadAppointments, // para forzar recarga si lo necesitas
  };
}
