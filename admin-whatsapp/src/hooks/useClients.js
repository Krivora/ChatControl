import { useState, useEffect } from "react";
import { getClients, getClientMessages } from "../api/clients";

export function useClients() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Traer clientes
  useEffect(() => {
    getClients()
      .then(data => {
        console.log("Clientes recibidos del backend:", data); // 🔹 Log aquí
        setClients(data);
      })
      .catch(err => console.error("Error fetch clients:", err))
      .finally(() => setLoadingClients(false));
  }, []);

  // Traer mensajes del cliente seleccionado
  useEffect(() => {
    if (!selectedClient) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    getClientMessages(selectedClient.id)
      .then(data => {
        console.log(`Mensajes del cliente ${selectedClient.id}:`, data); // 🔹 Log aquí
        setMessages(data);
      })
      .catch(err => console.error("Error fetch messages:", err))
      .finally(() => setLoadingMessages(false));
  }, [selectedClient]);

  return {
    clients,
    selectedClient,
    setSelectedClient,
    messages,
    loadingClients,
    loadingMessages,
  };
}
