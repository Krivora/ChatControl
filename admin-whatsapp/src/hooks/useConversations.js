// src/hooks/useConversations.js
import { useEffect, useState } from "react";
import { getConversations} from "../api";

export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getConversations();
        setConversations(data);
      } catch (err) {
        console.error("Error al cargar conversaciones", err);
      }
    };
    fetchData();
  }, []);

  const selectConversation = (id) => setSelectedId(id);

  return { conversations, selectedId, selectConversation };
}
