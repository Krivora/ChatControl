import { useState } from "react";
import { getAvailableSlots } from "../api";

export function useAvailableSlots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSlots = async (date) => {
    setError("");
    setLoading(true);
    try {
      const data = await getAvailableSlots(date);
      // Espera [{ slot_time: "09:00:00" }, ...]
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al obtener slots");
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  return { slots, loading, error, fetchSlots, setSlots };
}
