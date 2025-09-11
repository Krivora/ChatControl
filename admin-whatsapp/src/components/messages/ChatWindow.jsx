import React, { useState, useEffect } from "react";
import ChatBubble from "../ChatBubble";

export default function ChatWindow({ client, darkMode }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!client) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:5000/clients/${client.id}/messages`);
        let data = await res.json();

        // 🔹 Reemplazar "\n" por saltos reales
        data = data.map(msg => ({
          ...msg,
          text: msg.text.replace(/\\n/g, "\n"),
        }));

        setMessages(data);
      } catch (err) {
        console.error("Error al cargar mensajes:", err);
      }
    };

    fetchMessages();
  }, [client]);

  const handleSend = () => {
    if (!newMessage) return;

    const newMsg = {
      text: newMessage,
      sender: "client",
      created_at: new Date().toISOString(),
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  const formatMessage = (text) => {
    if (!text) return null;

    const lines = text.split("\n");
    const listItems = [];

    lines.forEach((line, idx) => {
      const listMatch = line.match(/^\d+️⃣\s*(.*)/);
      if (listMatch) {
        listItems.push(
          <li key={idx} style={{ marginBottom: "4px" }}>
            {listMatch[1]}
          </li>
        );
      } else {
        listItems.push(
          <div key={idx} style={{ marginBottom: "4px", whiteSpace: "pre-wrap" }}>
            {line}
          </div>
        );
      }
    });

    // Si hay algún <li>, envolverlos en un <ul> sin bullets
    if (listItems.some(item => item.type === "li")) {
      return <ul style={{ paddingLeft: "20px", margin: 0, listStyle: "none" }}>{listItems}</ul>;
    }

    return listItems;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRadius: "8px",
        backgroundColor: darkMode ? "#1f1f1f" : "#fff",
        padding: "10px",
      }}
    >
      <h3 style={{ color: darkMode ? "#fff" : "#000" }}>
        Chat con {client.nombre_completo}
      </h3>

      {/* Contenedor de mensajes con scroll */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          marginBottom: "10px",
          backgroundColor: darkMode ? "#121212" : "#f9f9f9",
          borderRadius: "8px",
          padding: "10px",
        }}
      >
        {messages.map((msg, idx) => (
          <ChatBubble
            key={idx}
            message={{
              ...msg,
              text: formatMessage(msg.text),
            }}
            darkMode={darkMode}
          />
        ))}
      </div>

      {/* Input siempre visible */}
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
            backgroundColor: "#4caf50",
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
