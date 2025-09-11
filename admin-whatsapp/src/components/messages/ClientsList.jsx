import React from "react";

export default function ClientsList({ clients, selectedClient, setSelectedClient, darkMode, setSelectedClientState }) {
  // setSelectedClientState se usa para volver a null en móvil
  const isMobile = window.innerWidth < 768; // Detecta móvil

  return (
    <div
      style={{
        background: darkMode ? "#222" : "#f4f4f4",
        borderRadius: "8px",
        padding: "1rem",
        height: "auto",
        maxHeight: "80vh",
        overflowY: "auto",
        width: "100%",
        boxSizing: "border-box",
        display: isMobile && selectedClient ? "none" : "block", // Oculta lista si hay cliente seleccionado en móvil
      }}
    >
      <h3
        style={{
          color: darkMode ? "#fff" : "#222",
          fontSize: "1.2rem",
          marginBottom: "0.8rem",
        }}
      >
        Clientes
      </h3>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {clients.map((client) => (
          <li
            key={client.id}
            onClick={() => setSelectedClient(client)}
            style={{
              padding: "0.75rem 1rem",
              marginBottom: "0.6rem",
              borderRadius: "6px",
              cursor: "pointer",
              background:
                selectedClient?.id === client.id
                  ? "#c3002eb7"
                  : darkMode
                  ? "#333"
                  : "#fff",
              color:
                selectedClient?.id === client.id
                  ? "#fff"
                  : darkMode
                  ? "#fff"
                  : "#222",
              border:
                selectedClient?.id === client.id
                  ? "2px solid #000000ff"
                  : "1px solid #000000ff",
              transition: "all 0.2s ease",
              fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
            }}
          >
            {client.nombre_completo}
          </li>
        ))}
      </ul>
    </div>
  );
}
