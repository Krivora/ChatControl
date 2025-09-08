import React from "react";

export default function ChatBubble({ message, darkMode }) {
  const isClient = message.sender === "client";

  return (
    <div
      style={{
        textAlign: isClient ? "left" : "right",
        marginBottom: "5px",
      }}
    >
      <span
        style={{
          display: "inline-block",
          maxWidth: "70%",
          padding: "8px 12px",
          borderRadius: "12px",
          backgroundColor: isClient
            ? darkMode
              ? "#333"    // fondo para cliente en oscuro
              : "#e0e0e0" // fondo para cliente en claro
            : darkMode
            ? "#4caf50"  // fondo para advisor en oscuro
            : "#4caf50", // fondo para advisor en claro (verde)
          color: isClient
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
