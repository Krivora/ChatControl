import React from "react";

export default function ClientsList({ clients, selectedClient, setSelectedClient, darkMode }) {
  return (
    <div
      style={{
        background: darkMode ? "#222" : "#f4f4f4",
        borderRadius: "8px",
        padding: "10px",
        height: "100%",
        overflowY: "auto",
      }}
    >
      <h3 style={{ color: darkMode ? "#fff" : "#222" }}>Clientes</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {clients.map(client => (
          <li
            key={client.id}
            onClick={() => setSelectedClient(client)}
            style={{
              padding: "8px",
              marginBottom: "6px",
              borderRadius: "6px",
              cursor: "pointer",
              background: selectedClient?.id === client.id
                ? "#4caf50"
                : darkMode ? "#333" : "#fff",
              color: selectedClient?.id === client.id
                ? "#fff"
                : darkMode ? "#fff" : "#222",
              border: selectedClient?.id === client.id
                ? "2px solid #388e3c"
                : "1px solid #ccc",
            }}
          >
            {client.nombre_completo}
          </li>
        ))}
      </ul>
    </div>
  );
}