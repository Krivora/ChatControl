import React, { useState, useEffect } from "react";

export default function Ponderacion({ client, darkMode }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mapeo claves mensajes_bot → campos client
  const keyMap = {
    "pregunta_nombre": "nombre_completo",
    "pregunta_tipo_compra": "tipo_compra",
    "pregunta_tipo_auto": "tipo_auto",
    "pregunta_presupuesto_maximo": "presupuesto_maximo",
    "pregunta_pago_inicial": "pago_inicial",
    "pregunta_cuota_mensual": "cuota_mensual_maxima",
    "pregunta_buro_credito": "historial_crediticio",
    "pregunta_tiempo_estreno": "tiempo_estreno",
    "pregunta_marca_modelo": "marca_modelo"
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/messages");
        const mensajesBot = await res.json();

        const mensajesCombinados = mensajesBot.flatMap((msg) => {
          const respuesta =
            client && keyMap[msg.clave]
              ? client[keyMap[msg.clave]] ?? "No respondido"
              : "No respondido";

          return [
            { tipo: "pregunta", texto: msg.mensaje, id: msg.id },
            { tipo: "respuesta", texto: respuesta.toString(), id: msg.id }
          ];
        });

        setMessages(mensajesCombinados);
      } catch (err) {
        console.error("Error al cargar mensajes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [client]);

  if (loading) {
    return (
      <div
        style={{
          padding: 10,
          backgroundColor: darkMode ? "#222" : "#f4f4f4",
          borderRadius: 8,
          height: "55%",
        }}
      >
        Cargando ponderación...
      </div>
    );
  }

  return (
    <div
      style={{
        background: darkMode ? "#222" : "#f4f4f4",
        borderRadius: 8,
        padding: 10,
        height: "55%",
        overflowY: "auto",
        boxSizing: "border-box",
      }}
    >
      <h3 style={{ color: darkMode ? "#fff" : "#222", marginBottom: 10 }}>
        Ponderación
      </h3>

      <p style={{ color: darkMode ? "#fff" : "#222", marginBottom: 10 }}>
        Total de mensajes: <strong>{messages.length}</strong>
      </p>

      <h4 style={{ color: darkMode ? "#fff" : "#222", marginBottom: 5 }}>
        Preguntas / Respuestas:
      </h4>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((msg, idx) => (
          <div
            key={`${msg.id}-${idx}`}
            style={{
              padding: 8,
              borderRadius: 6,
              backgroundColor:
                msg.tipo === "pregunta"
                  ? darkMode
                    ? "#1a1a1a"
                    : "#fff"
                  : darkMode
                  ? "#333"
                  : "#f0f0f0",
              color: darkMode ? "#fff" : "#000",
              boxShadow: darkMode
                ? "0 0 3px rgba(255,255,255,0.05)"
                : "0 0 3px rgba(0,0,0,0.1)",
            }}
          >
            {msg.tipo === "pregunta" ? <strong>Pregunta:</strong> : <strong>Respuesta:</strong>}{" "}
            {msg.texto}
          </div>
        ))}
      </div>
    </div>
  );
}
