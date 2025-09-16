import React, { useEffect, useState } from "react";

export default function Ponderacion({ client, darkMode }) {
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client?.conversation_id) {
      setChat([]);
      setLoading(false);
      return;
    }

    const fetchAnswers = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:5000/api/messages/answers/${client.conversation_id}`
        );
        const answers = await res.json();

        // 🔹 Preguntas que queremos mostrar y en orden
        const preguntasOrdenadas = [
          {
            key: "down_payment_max",
            texto: "Cuál sería el máximo que podrías dar de pago inicial? 💵"
          },
          {
            key: "max_monthly_payment",
            texto: "💳 ¿Cuál sería tu MÁXIMO de mensualidad?"
          },
          {
            key: "credit_bureau_status",
            texto: "¿Cómo está tu buró de crédito actualmente? 🤔"
          },
          {
            key: "time_to_buy",
            texto: "Excelente 🙌 y dime, ¿qué tan pronto quieres estrenar tu carro? 🚗✨"
          }
        ];

        // 🔹 Mapear respuestas a preguntas
        const chatData = preguntasOrdenadas.map((preg) => {
          const answer = answers.find((a) => a.question_key === preg.key);
          return {
            pregunta: preg.texto,
            respuesta: answer ? answer.answer_value : "(sin respuesta)"
          };
        });

        setChat(chatData);
      } catch (err) {
        console.error("Error al cargar answers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnswers();
  }, [client]);

  if (loading) return <div>Cargando ponderación...</div>;
  if (!client) return <div>Selecciona un cliente para ver la ponderación</div>;

  return (
    <div
      style={{
        background: darkMode ? "#222" : "#f4f4f4",
        borderRadius: 8,
        padding: 10,
        height: "55%",
        overflowY: "auto"
      }}
    >
      <h3 style={{ color: darkMode ? "#fff" : "#222", marginBottom: 10 }}>
        Preguntas y Respuestas
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {chat.map((item, idx) => (
          <div
            key={idx}
            style={{
              padding: 10,
              borderRadius: 6,
              backgroundColor: darkMode ? "#1a1a1a" : "#fff",
              color: darkMode ? "#fff" : "#000",
              boxShadow: darkMode
                ? "0 0 3px rgba(255,255,255,0.05)"
                : "0 0 3px rgba(0,0,0,0.1)"
            }}
          >
            <strong>Pregunta:</strong> {item.pregunta}
            <br />
            <strong>Respuesta:</strong> {item.respuesta}
          </div>
        ))}
      </div>
    </div>
  );
}
