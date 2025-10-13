import { useState, useEffect, useRef } from "react";
import { AssignmentsApi } from "../api/assignments";

export function useAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const firstLoad = useRef(true);

  const loadAssignments = async () => {
    try {
      if (firstLoad.current) setLoading(true);
      const res = await AssignmentsApi.list();
      const newData = Array.isArray(res) ? res : [];

      setAssignments((prev) => {
        const prevMap = new Map(prev.map(a => [a.id, a]));
        const merged = [];

        for (const a of newData) {
          const existing = prevMap.get(a.id);
          if (!existing) {
            merged.push({ ...a, _new: true });
          } else {
            // 🔄 actualizada o igual
            merged.push(
              JSON.stringify(existing) === JSON.stringify(a)
                ? existing
                : { ...a, _updated: true }
            );
          }
          prevMap.delete(a.id);
        }
        return merged;
      });
    } catch (err) {
      console.error("Error cargando asignaciones", err);
      setError(err.message || "Error al cargar asignaciones");
    } finally {
      if (firstLoad.current) {
        setLoading(false);
        firstLoad.current = false;
      }
    }
  };

  // 🔁 Auto-recarga cada 10s
  useEffect(() => {
    loadAssignments();
    return () => {};
  }, []);


  // ⏳ Limpiar flags _new y _updated
  useEffect(() => {
    if (assignments.some(a => a._new || a._updated)) {
      const timer = setTimeout(() => {
        setAssignments(prev =>
          prev.map(({ _new, _updated, ...rest }) => rest)
        );
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [assignments]);

  return {
    assignments,
    setAssignments, // para actualizar manualmente
    loading,
    error,
    reload: loadAssignments, // para forzar recarga
  };
}
