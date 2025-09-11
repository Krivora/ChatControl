import React, { useState, useEffect } from "react";
import ClientsList from "../components/messages/ClientsList";
import ChatWindow from "../components/messages/ChatWindow";
import Ponderacion from "../components/messages/Ponderacion";
import { useClients } from "../hooks/useClients";

export default function MessagesPage({ darkMode }) {
  const { clients, selectedClient, setSelectedClient, messages, loadingClients, loadingMessages } = useClients();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // 🔹 Log de los clientes que llegan del hook
  useEffect(() => {
    console.log("Clientes cargados desde useClients:", clients);
  }, [clients]);

  // 🔹 Log del cliente seleccionado
  useEffect(() => {
    if (selectedClient) {
      console.log("Cliente seleccionado:", selectedClient);
    }
  }, [selectedClient]);

  // 🔹 Detecta resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loadingClients) return <p>Cargando clientes...</p>;

  const showPlaceholder = !selectedClient;

  return (
    <div
      style={{
        display: "grid",
        gap: "15px",
        padding: "20px",
        minHeight: "100vh",
        boxSizing: "border-box",
        backgroundColor: darkMode ? "#121212" : "#f5f5f5",
        gridTemplateColumns: isMobile
          ? "1fr"
          : selectedClient
          ? "2fr 3fr 2fr"
          : "1fr 5fr",
        height: "75vh",
      }}
    >
      <ClientsList
        clients={clients}
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
        darkMode={darkMode}
      />

      {showPlaceholder ? (
        <div
          style={{
            padding: "15px",
            borderRadius: "8px",
            backgroundColor: darkMode ? "#2a2a2a" : "#f5f5f5",
            color: darkMode ? "#fff" : "#333",
            height: "90%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: darkMode
              ? "0 0 5px rgba(255,255,255,0.05)"
              : "0 0 5px rgba(0,0,0,0.08)",
            fontSize: "16px",
            textAlign: "center",
          }}
        >
          Selecciona un cliente para ver el chat y la ponderación
        </div>
      ) : (
        <>
          <ChatWindow client={selectedClient} darkMode={darkMode} messages={messages} />
          <Ponderacion darkMode={darkMode} messages={messages} loading={loadingMessages} />
        </>
      )}
    </div>
  );
}
