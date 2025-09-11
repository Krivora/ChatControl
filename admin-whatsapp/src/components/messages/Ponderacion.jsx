import React from "react";

export default function Ponderacion({ messages, darkMode }) {
  // Ejemplo: contar mensajes y mostrar un "score"
  const score = messages.length;

  return (
    <div
      style={{
        background: darkMode ? "#222" : "#f4f4f4",
        borderRadius: "8px",
        padding: "10px",
        height: "100%",
      }}
    >
      <h3 style={{ color: darkMode ? "#fff" : "#222" }}>Ponderación</h3>
      <p style={{ color: darkMode ? "#fff" : "#222" }}>
        Total de mensajes: <strong>{score}</strong>
      </p>
      {/* Aquí puedes agregar más lógica de ponderación */}
    </div>
  );
}