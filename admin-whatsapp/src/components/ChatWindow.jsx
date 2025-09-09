import React, { useState } from "react";
import ChatBubble from "./ChatBubble";

export default function ChatWindow({ client, darkMode }) {
  const [messages, setMessages] = useState([
    { sender: "client", text: "Hola" },
    { sender: "advisor", text: "¡Hola! Gracias por tu interés 😊" },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (!newMessage) return;
    setMessages([...messages, { sender: "advisor", text: newMessage }]);
    setNewMessage("");
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: darkMode ? "#1f1f1f" : "#ffffff",
        borderRadius: "8px",
        padding: "10px",
        boxShadow: darkMode
          ? "0 0 5px rgba(255,255,255,0.05)"
          : "0 0 5px rgba(0,0,0,0.1)",
      }}
    >
      <h3 style={{ color: darkMode ? "#fff" : "#000" }}>
        Chat con {client.name}
      </h3>

      <div
        style={{
          border: darkMode ? "1px solid #333" : "1px solid #ccc",
          height: "300px",
          padding: "10px",
          overflowY: "auto",
          flex: 1,
          marginBottom: "10px",
          backgroundColor: darkMode ? "#121212" : "#f9f9f9",
          borderRadius: "8px",
        }}
      >
        {messages.map((msg, idx) => (
          <ChatBubble key={idx} message={msg} darkMode={darkMode} />
        ))}
      </div>

      <div style={{ display: "flex", gap: "5px" }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "6px",
            border: darkMode ? "1px solid #333" : "1px solid #ccc",
            backgroundColor: darkMode ? "#1a1a1a" : "#fff",
            color: darkMode ? "#fff" : "#000",
          }}
        />
        <button
          onClick={handleSend}
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: darkMode ? "#4caf50" : "#4caf50",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
