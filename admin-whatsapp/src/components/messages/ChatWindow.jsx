import React, { useState, useEffect } from "react";
import ChatBubble from "../messages/ChatBubble";

export default function ChatWindow({ client, darkMode }) {
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState(""); // 🔹 debe ser string, no array

  useEffect(() => {
    if (!client?.conversation_id) return;

    let isMounted = true;

    const fetchChat = async () => {
      try {
        const [resMessages, resAnswers] = await Promise.all([
          fetch(`http://localhost:5000/api/messages/conversation/${client.conversation_id}`),
          fetch(`http://localhost:5000/api/messages/answers/${client.conversation_id}`)
        ]);

        const messages = await resMessages.json();
        const answers = await resAnswers.json();
        const answersCopy = [...answers];

        const chatData = messages.map(msg => {
          if (msg.sender === "bot") {
            return { sender: "system", text: msg.content, created_at: msg.created_at };
          } else {
            let text = msg.content;

            if (answersCopy.length > 0) {
              const nextAnswer = answersCopy[0];
              const msgTime = new Date(msg.created_at).getTime();
              const answerTime = new Date(nextAnswer.created_at).getTime();

              if (msgTime >= answerTime) {
                text = nextAnswer.answer_value;
                answersCopy.shift();
              }
            }

            return { sender: "client", text, created_at: msg.created_at };
          }
        });

        if (isMounted) setChatMessages(chatData);
      } catch (err) {
        console.error("Error al cargar chat:", err);
      }
    };

    fetchChat();

    return () => {
      isMounted = false;
      setChatMessages([]);
    };
  }, [client]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const newMsg = { text: newMessage, sender: "client", created_at: new Date().toISOString() };
    setChatMessages([...chatMessages, newMsg]);
    setNewMessage("");
  };

  if (!client) return <p>Selecciona un cliente para ver el chat</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "55%", borderRadius: 8, backgroundColor: darkMode ? "#1f1f1f" : "#fff", padding: 10 }}>
      <h3 style={{ color: darkMode ? "#fff" : "#000" }}>Chat con {client.full_name}</h3>
      <div style={{ flex: 1, overflowY: "auto", marginBottom: 10, backgroundColor: darkMode ? "#121212" : "#f9f9f9", borderRadius: 8, padding: 10 }}>
        {chatMessages.map((msg, idx) => (
          <ChatBubble key={idx} message={msg} darkMode={darkMode} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 5 }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          style={{ flex: 1, padding: 8, borderRadius: 6, border: darkMode ? "1px solid #333" : "1px solid #ccc", backgroundColor: darkMode ? "#1a1a1a" : "#fff", color: darkMode ? "#fff" : "#000" }}
        />
        <button onClick={handleSend} style={{ padding: "8px 12px", borderRadius: 6, border: "none", backgroundColor: "#4caf50", color: "#fff", cursor: "pointer" }}>
          Enviar
        </button>
      </div>
    </div>
  );
}
