import React, { useState, useEffect } from "react";
import ChatWindow from "./ChatWindow";

// 🔹 Formatea el texto igual que en ChatWindow
const formatText = (text) => {
  if (!text) return null;
  const lines = text.split(/\r?\n/);
  return lines.map((line, idx) => {
    const listMatch = line.match(/^\d+️⃣\s*(.*)/);
    if (listMatch) {
      return (
        <li key={idx} style={{ marginBottom: "4px" }}>
          {listMatch[1]}
        </li>
      );
    }
    return (
      <div key={idx} style={{ marginBottom: "4px", whiteSpace: "pre-wrap" }}>
        {line}
      </div>
    );
  });
};

function Ponderacion({ darkMode, messages }) {
  if (!messages || messages.length === 0)
    return (
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
        No hay preguntas para mostrar
      </div>
    );

  // 🔹 Excluir claves que no quieres mostrar
  const mensajesFiltrados = messages.filter(
    (msg) => msg.clave !== "saludo_inicial" && msg.clave !== "pregunta_nombre"
  );

  let valor = 25; // valor inicial
  const bloques = [];

  // 🔹 Agrupar pregunta + respuesta
  for (let i = 0; i < mensajesFiltrados.length; i += 2) {
    const pregunta = mensajesFiltrados[i];
    const respuesta = mensajesFiltrados[i + 1]; // puede ser undefined

    const valorActual = valor;

    bloques.push(
      <div
        key={i}
        style={{
          backgroundColor: darkMode ? "#333" : "#f3f3f3",
          padding: "10px",
          borderRadius: "6px",
        }}
      >
        {pregunta && (
          <div style={{ marginBottom: "5px" }}>
            <strong>Pregunta:</strong>
            <div>{pregunta.text}</div>
          </div>
        )}

        {respuesta && (
          <div style={{ marginBottom: "5px" }}>
            <strong>Respuesta:</strong>
            <div>{respuesta.text}</div>
          </div>
        )}

        <p style={{ fontWeight: "bold" }}>Valor = {valorActual} puntos</p>
      </div>
    );

    valor += 20;
  }

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
        height: "90%",
        overflowY: "auto",
      }}
    >
      <h3 style={{ color: darkMode ? "#fff" : "#1a1a1a" }}>Ponderación</h3>
      {bloques}
    </div>
  );
}

export default function MessagesView({ darkMode }) {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [messages, setMessages] = useState([]);

  // 🔹 Fetch clientes
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch("http://192.168.45.60:5000/clients");
        const data = await res.json();
        setClients(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchClients();
  }, []);

  // 🔹 Detecta mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const showPlaceholder = !selectedClient;

  // 🔹 Fetch mensajes cuando cambia el cliente
  useEffect(() => {
    if (!selectedClient) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/clients/${selectedClient.id}/messages`
        );
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
  }, [selectedClient]);

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
            height: "90%",
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

      {/* Chat + Ponderación */}
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
              height: "90%",
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
              height: "90%",
              overflowY: "auto",
            }}
          >
            <Ponderacion darkMode={darkMode} messages={messages} />
          </div>
        </>
      )}
    </div>
  );
}
