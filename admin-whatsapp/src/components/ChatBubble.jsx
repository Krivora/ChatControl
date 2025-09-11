import React from "react";

export default function ChatBubble({ message, darkMode }) {
  // Ahora true si es recibido (system), false si es enviado (client)
  const isReceived = message.sender !== "client";

  return (
    <div
      style={{
        textAlign: isReceived ? "left" : "right", // recibidos a la izquierda
        marginBottom: "5px",
      }}
    >
      <span
        style={{
          display: "inline-block",
          maxWidth: "70%",
          padding: "8px 12px",
          borderRadius: "12px",
          backgroundColor: isReceived
            ? darkMode
              ? "#333"    // gris oscuro para mensajes recibidos
              : "#e0e0e0" // gris claro para mensajes recibidos
            : darkMode
            ? "#4caf50"  // verde oscuro para mensajes enviados
            : "#4caf50", // verde claro para mensajes enviados
          color: isReceived
            ? darkMode
              ? "#fff"
              : "#000"
            : "#fff",
          wordWrap: "break-word",
        }}
      >
        {message.text}
      </span>
    </div>
  );
}
