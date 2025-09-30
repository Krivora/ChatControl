import { useState, useEffect, useRef } from "react";
import { getConversations } from "../api/conversations";

export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const firstLoad = useRef(true);

  const loadConversations = async () => {
    try {
      if (firstLoad.current) setLoading(true);
      const data = await getConversations();
      const newData = Array.isArray(data) ? data : [];

      setConversations((prev) => {
        const prevMap = new Map(prev.map((c) => [c.id, c]));
        const merged = [];

        for (const c of newData) {
          const existing = prevMap.get(c.id);
          if (!existing) {
            merged.push({ ...c, _new: true }); // nueva conversación
          } else {
            merged.push(
              JSON.stringify(existing) === JSON.stringify(c)
                ? existing // igual
                : { ...c, _updated: true } // actualizada
            );
          }
          prevMap.delete(c.id);
        }

        return merged;
      });
    } catch (err) {
      console.error("Error cargando conversaciones", err);
      setError(err.message || "Error al cargar conversaciones");
    } finally {
      if (firstLoad.current) {
        setLoading(false);
        firstLoad.current = false;
      }
    }
  };

  // 🔁 auto-recarga cada 10s
  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  // ⏳ limpia flags de animación (_new / _updated)
  useEffect(() => {
    if (conversations.some((c) => c._new || c._updated)) {
      const timer = setTimeout(() => {
        setConversations((prev) =>
          prev.map(({ _new, _updated, ...rest }) => rest)
        );
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [conversations]);

  return {
    conversations,
    setConversations,
    loading,
    error,
    reload: loadConversations,
  };
}
