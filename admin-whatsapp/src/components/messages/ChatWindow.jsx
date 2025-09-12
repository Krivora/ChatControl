import React, { useState, useEffect } from "react";
import ChatBubble from "../messages/ChatBubble";

export default function ChatWindow({ client, darkMode }) {
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!client) return;

    const fetchChat = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/messages");
        const mensajesBot = await res.json();

        // 🔹 Filtramos solo los mensajes donde hay respuesta en el cliente
        const chatPerfil = mensajesBot.flatMap(msg => {
          let respuesta = null;

          switch (msg.clave) {
            case "pregunta_tipo_compra": respuesta = client.tipo_compra; break;
            case "pregunta_tipo_auto": respuesta = client.tipo_auto; break;
            case "pregunta_presupuesto_maximo": respuesta = client.presupuesto_maximo; break;
            case "pregunta_pago_inicial": respuesta = client.pago_inicial; break;
            case "pregunta_cuota_mensual": respuesta = client.cuota_mensual_maxima; break;
            case "pregunta_buro_credito": respuesta = client.historial_crediticio; break;
            case "pregunta_tiempo_estreno": respuesta = client.tiempo_estreno; break;
            case "pregunta_marca_modelo": respuesta = client.marca_modelo; break;
            default: break;
          }

          if (respuesta !== null && respuesta !== undefined && respuesta !== "") {
            return [
              { sender: "system", text: msg.mensaje },
              { sender: "client", text: respuesta.toString() }
            ];
          }
          return []; // nada si no hay respuesta
        });

        setChatMessages(chatPerfil);
      } catch (err) {
        console.error("Error al cargar chat:", err);
      }
    };

    fetchChat();
  }, [client]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const newMsg = {
      text: newMessage,
      sender: "client",
      created_at: new Date().toISOString(),
    };

    setChatMessages([...chatMessages, newMsg]);
    setNewMessage("");
  };

  const formatMessage = (text) => {
  if (!text) return null;

  // 🔹 Reemplaza los "\n" literales por saltos de línea reales
  const cleanedText = text.replace(/\\n/g, "\n");

  // 🔹 Separa por líneas
  const lines = cleanedText.split(/\n/);

  // 🔹 Genera elementos
  const listItems = lines.map((line, idx) => {
    const listMatch = line.match(/^\d+️⃣\s*(.*)/); // Detecta listas
    return listMatch ? (
      <li key={idx} style={{ marginBottom: 4 }}>{listMatch[1]}</li>
    ) : (
      <div key={idx} style={{ marginBottom: 4, whiteSpace: "pre-wrap" }}>{line}</div>
    );
  });

  // 🔹 Si hay <li>, envuelve en <ul>
  if (listItems.some(item => item.type === "li")) {
    return <ul style={{ paddingLeft: 20, margin: 0, listStyle: "none" }}>{listItems}</ul>;
  }

  return listItems;
};


  return (
    <div style={{ display: "flex", flexDirection: "column", height: "55%", borderRadius: 8, backgroundColor: darkMode ? "#1f1f1f" : "#fff", padding: 10 }}>
      <h3 style={{ color: darkMode ? "#fff" : "#000" }}>Chat con {client.nombre_completo}</h3>
      <div style={{ flex: 1, overflowY: "auto", marginBottom: 10, backgroundColor: darkMode ? "#121212" : "#f9f9f9", borderRadius: 8, padding: 10 }}>
        {chatMessages.map((msg, idx) => (
          <ChatBubble key={idx} message={{ ...msg, text: formatMessage(msg.text) }} darkMode={darkMode} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 5 }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 6,
            border: darkMode ? "1px solid #333" : "1px solid #ccc",
            backgroundColor: darkMode ? "#1a1a1a" : "#fff",
            color: darkMode ? "#fff" : "#000",
          }}
        />
        <button onClick={handleSend} style={{ padding: "8px 12px", borderRadius: 6, border: "none", backgroundColor: "#4caf50", color: "#fff", cursor: "pointer" }}>Enviar</button>
      </div>
    </div>
  );
}
