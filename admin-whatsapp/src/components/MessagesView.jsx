// MessagesView.jsx
import React, { useState, useEffect } from "react";
import ChatWindow from "./ChatWindow";

function Ponderacion({ darkMode, client }) {
  if (!client)
    return (
      <div
        style={{
          padding: "15px",
          borderRadius: "8px",
          backgroundColor: darkMode ? "#2a2a2a" : "#f5f5f5",
          color: darkMode ? "#fff" : "#333",
          height: "100%",
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
        Favor de seleccionar un cliente para ver la ponderación
      </div>
    );

  return (
    <div
      style={{
        padding: "15px",
        borderRadius: "8px",
        backgroundColor: darkMode ? "#2a2a2a" : "#ffffff",
        color: darkMode ? "#fff" : "#333",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        boxShadow: darkMode
          ? "0 0 5px rgba(255,255,255,0.05)"
          : "0 0 5px rgba(0,0,0,0.08)",
        height: "100%",
      }}
    >
      <h3 style={{ color: darkMode ? "#fff" : "#1a1a1a" }}>Ponderación</h3>
      <div
        style={{
          backgroundColor: darkMode ? "#333" : "#f3f3f3",
          padding: "10px",
          borderRadius: "6px",
        }}
      >
        <strong>Pregunta 1:</strong>
        <p>¿Cuál sería el máximo que podrías dar de pago inicial? 💵</p>
        <p>Valor = {client.id * 10 + 15} puntos</p>
      </div>
      <div
        style={{
          backgroundColor: darkMode ? "#333" : "#f3f3f3",
          padding: "10px",
          borderRadius: "6px",
        }}
      >
        <strong>Pregunta 2:</strong>
        <p>💳 ¿Cuál sería tu MÁXIMO de mensualidad?</p>
        <p>Valor = {client.id * 8 + 14} puntos</p>
      </div>
    </div>
  );
}

export default function MessagesView({ darkMode }) {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // 🔹 Fetch clientes desde backend
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch("http://192.168.45.60:5000/clients"); // Cambia localhost por tu IP si es necesario
        const data = await res.json();
        setClients(data);
      } catch (err) {
        console.error("Error al cargar clientes:", err);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        height: "95%",
      }}
    >
      {/* Clientes */}
      {(!isMobile || !selectedClient) && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            gap: "10px",
            backgroundColor: darkMode ? "#1f1f1f" : "#ffffff",
            padding: isMobile ? "10px" : "15px",
            borderRadius: "8px",
            boxShadow: darkMode
              ? "0 0 5px rgba(255,255,255,0.05)"
              : "0 0 5px rgba(0,0,0,0.08)",
            height: "95%",
            overflowY: "auto",
          }}
        >
          <h3
            style={{
              color: darkMode ? "#fff" : "#1a1a1a",
              fontSize: isMobile ? "16px" : "18px",
            }}
          >
            Clientes
          </h3>
          {clients.map((client) => (
            <div
              key={client.id}
              onClick={() => setSelectedClient(client)}
              style={{
                padding: "10px",
                borderRadius: "6px",
                backgroundColor: darkMode ? "#333" : "#f3f3f3",
                color: darkMode ? "#fff" : "#333",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = darkMode ? "#444" : "#e2e2e2";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = darkMode ? "#333" : "#f3f3f3";
              }}
            >
              {client.nombre_completo} ({client.paso_actual === 0 ? "Pendiente" : "Completo"})
            </div>
          ))}
        </div>
      )}

      {/* Placeholder o Chat + Ponderación */}
      {showPlaceholder ? (
        <div
          style={{
            padding: "15px",
            borderRadius: "8px",
            backgroundColor: darkMode ? "#2a2a2a" : "#f5f5f5",
            color: darkMode ? "#fff" : "#333",
            height: "95%",
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
          Favor de seleccionar un cliente para ver el chat y la ponderación
        </div>
      ) : (
        <>
          {/* Chat */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              padding: "0px",
              borderRadius: "8px",
              height: "95%",
              overflowY: "auto",
            }}
          >
            {isMobile && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  color: darkMode ? "#fff" : "#333",
                  marginBottom: "10px",
                  padding: "0 15px",
                }}
                onClick={() => setSelectedClient(null)}
              >
                ← Volver a la lista de clientes
              </div>
            )}
            <ChatWindow client={selectedClient} darkMode={darkMode} />
          </div>

          {/* Ponderación */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              height: "95%",
              overflowY: "auto",
            }}
          >
            <Ponderacion darkMode={darkMode} client={selectedClient} />
          </div>
        </>
      )}
    </div>
  );
}
