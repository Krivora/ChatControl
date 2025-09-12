import React, { useState, useEffect } from "react";
import ClientsList from "../components/messages/ClientsList";
import ChatWindow from "../components/messages/ChatWindow";
import Ponderacion from "../components/messages/Ponderacion";
import { useClients } from "../hooks/useClients";

export default function MessagesPage({ darkMode }) {
  const { clients, selectedClient, setSelectedClient, messages, loadingClients, loadingMessages } = useClients();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Logs
  useEffect(() => {
    console.log("Clientes cargados desde useClients:", clients);
  }, [clients]);
  useEffect(() => {
    if (selectedClient) console.log("Cliente seleccionado:", selectedClient);
  }, [selectedClient]);

  // Detecta resize
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
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
        gap: "15px",
        height: "160vh", // altura de la ventana
        padding: "20px",
        boxSizing: "border-box",
        backgroundColor: darkMode ? "#121212" : "#f5f5f5",
      }}
    >
      {/* Clientes */}
      <div style={{ height: "100%", overflowY: "auto" }}>
        <ClientsList
          clients={clients}
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
          darkMode={darkMode}
        />
      </div>

      {/* Chat + Placeholder */}
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          gridColumn: showPlaceholder ? "2 / 4" : "auto", // placeholder ocupa Chat + Ponderación
        }}
      >
        {showPlaceholder ? (
          <div
            style={{
              padding: "15px",
              borderRadius: "8px",
              backgroundColor: darkMode ? "#2a2a2a" : "#f5f5f5",
              color: darkMode ? "#fff" : "#333",
              height: "86vh", // ocupa todo el contenedor
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
          <ChatWindow
            client={selectedClient}
            darkMode={darkMode}
            messages={messages}
            fixedHeight="100%" // ChatWindow ocupa todo el contenedor
          />
        )}
      </div>

        {/* Ponderación solo si hay cliente seleccionado */}
        {!showPlaceholder && (
          <div style={{ height: "100%", overflowY: "auto" }}>
            <Ponderacion
              client={selectedClient}  // <--- PASAR EL CLIENTE AQUÍ
              darkMode={darkMode}
            />
          </div>
        )}


    </div>
  );
}
