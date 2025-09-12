import React, { useState, useEffect } from "react";

export default function Ponderacion({ client, darkMode }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const fetchPonderacion = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/messages");
        const mensajesBot = await res.json();

        const chatPerfil = mensajesBot.flatMap((msg) => {
          let respuesta = null;

          switch (msg.clave) {
            case "pregunta_nombre":
              respuesta = client.nombre_completo;
              break;
            case "pregunta_tipo_compra":
              respuesta = client.tipo_compra;
              break;
            case "pregunta_tipo_auto":
              respuesta = client.tipo_auto;
              break;
            case "pregunta_presupuesto_maximo":
              respuesta = client.presupuesto_maximo;
              break;
            case "pregunta_pago_inicial":
              respuesta = client.pago_inicial;
              break;
            case "pregunta_cuota_mensual":
              respuesta = client.cuota_mensual_maxima;
              break;
            case "pregunta_buro_credito":
              respuesta = client.historial_crediticio;
              break;
            case "pregunta_tiempo_estreno":
              respuesta = client.tiempo_estreno;
              break;
            case "pregunta_marca_modelo":
              respuesta = client.marca_modelo;
              break;
            default:
              break;
          }

          if (respuesta !== null && respuesta !== undefined && respuesta !== "") {
            return [
              { tipo: "pregunta", texto: msg.mensaje, id: msg.id, clave: msg.clave },
              { tipo: "respuesta", texto: respuesta.toString(), id: msg.id },
            ];
          }

          return [];
        });

        setMessages(chatPerfil);
      } catch (err) {
        console.error("Error al cargar ponderación:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPonderacion();
  }, [client]);

  // 🔹 Formatea mensajes quitando saltos de línea y haciendo listas de opciones
  // 🔹 Formatea mensajes para PREGUNTAS (sí convierte en listas)
const formatPregunta = (text) => {
  if (!text) return null;

  const cleanText = text.replace(/\\n/g, "\n");
  const lines = cleanText
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div>
      {lines.map((line, idx) => {
        // Solo convertir a lista si parece opción (empieza con número o emoji)
        if (/^[0-9]+|[0-9️⃣]/.test(line)) {
          return (
            <li key={idx} style={{ marginLeft: "20px" }}>
              {line}
            </li>
          );
        }
        return <div key={idx}>{line}</div>;
      })}
    </div>
  );
};

// 🔹 Formatea mensajes para RESPUESTAS (nunca en listas)
const formatRespuesta = (text) => {
  if (!text) return null;

  const cleanText = text.replace(/\\n/g, " ");
  return <div>{cleanText}</div>;
};


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

  if (!client) {
    return (
      <div
        style={{
          padding: 10,
          backgroundColor: darkMode ? "#222" : "#f4f4f4",
          borderRadius: 8,
          height: "55%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: darkMode ? "#fff" : "#222",
        }}
      >
        Selecciona un cliente para ver la ponderación
      </div>
    );
  }

  // 🔹 Calcula total de puntos
  let totalPuntos = 0;

  messages
    .filter((msg) => msg.tipo === "pregunta")
    .forEach((pregunta) => {
      const respuesta = messages.find((r) => r.tipo === "respuesta" && r.id === pregunta.id);
      let valor = 0;

      if (respuesta) {
        const r = respuesta.texto.trim().replace(/–/g, "-");

        switch (pregunta.clave) {
          case "pregunta_buro_credito":
            switch (r.toLowerCase()) {
              case "mal":
                valor = 5;
                break;
              case "regular":
                valor = 15;
                break;
              case "bien":
                valor = 30;
                break;
              case "excelente":
                valor = 50;
                break;
            }
            break;
          case "pregunta_pago_inicial":
            switch (r) {
              case "$30,000 - $50,000":
              case "$50,000 - $70,000":
                valor = 15;
                break;
              case "$70,000 - $100,000":
                valor = 20;
                break;
              case "$100,000 - $200,000":
              case "$200,000 o más":
                valor = 25;
                break;
            }
            break;
          case "pregunta_cuota_mensual":
            switch (r) {
              case "$4,000 - $5,500":
              case "$5,500 - $7,000":
              case "$7,000 - $9,000":
              case "$9,000 o más":
                valor = 25;
                break;
            }
            break;
          case "pregunta_tiempo_estreno":
            switch (r) {
              case "Ya estoy listo":
                valor = 70;
                break;
              case "De 1 a 15 días":
                valor = 15;
                break;
              case "De 15 a 30 días":
                valor = 10;
                break;
              case "Más de 30 días":
                valor = 5;
                break;
            }
            break;
          default:
            break;
        }

        totalPuntos += valor;
      }
    });

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
      <h3 style={{ color: darkMode ? "#fff" : "#222", marginBottom: 10 }}>Ponderación</h3>

      <p style={{ color: darkMode ? "#fff" : "#222", marginBottom: 10 }}>
        Total de puntos: <strong>{totalPuntos}</strong>
      </p>

      <h4 style={{ color: darkMode ? "#fff" : "#222", marginBottom: 5 }}>Preguntas / Respuestas:</h4>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
  {messages
    .filter((msg) => msg.tipo === "pregunta")
    .map((pregunta) => {
      const respuesta = messages.find(
        (r) => r.tipo === "respuesta" && r.id === pregunta.id
      );
      let valorTexto = null;

      if (respuesta) {
        const r = respuesta.texto.trim().replace(/–/g, "-");
        switch (pregunta.clave) {
          case "pregunta_buro_credito":
            switch (r.toLowerCase()) {
              case "mal":
                valorTexto = "5 puntos";
                break;
              case "regular":
                valorTexto = "15 puntos";
                break;
              case "bien":
                valorTexto = "30 puntos";
                break;
              case "excelente":
                valorTexto = "50 puntos";
                break;
            }
            break;
          case "pregunta_pago_inicial":
            switch (r) {
              case "$30,000 - $50,000":
              case "$50,000 - $70,000":
                valorTexto = "15 puntos";
                break;
              case "$70,000 - $100,000":
                valorTexto = "20 puntos";
                break;
              case "$100,000 - $200,000":
              case "$200,000 o más":
                valorTexto = "25 puntos";
                break;
            }
            break;
          case "pregunta_cuota_mensual":
            switch (r) {
              case "$4,000 - $5,500":
              case "$5,500 - $7,000":
              case "$7,000 - $9,000":
              case "$9,000 o más":
                valorTexto = "25 puntos";
                break;
            }
            break;
          case "pregunta_tiempo_estreno":
            switch (r) {
              case "Ya estoy listo":
                valorTexto = "70 puntos";
                break;
              case "De 1 a 15 días":
                valorTexto = "15 puntos";
                break;
              case "De 15 a 30 días":
                valorTexto = "10 puntos";
                break;
              case "Más de 30 días":
                valorTexto = "5 puntos";
                break;
            }
            break;
          default:
            break;
        }
      }

      if (!valorTexto) return null;

      return (
        <div
          key={pregunta.id}
          style={{
            padding: 10,
            borderRadius: 6,
            backgroundColor: darkMode ? "#1a1a1a" : "#fff",
            color: darkMode ? "#fff" : "#000",
            boxShadow: darkMode
              ? "0 0 3px rgba(255,255,255,0.05)"
              : "0 0 3px rgba(0,0,0,0.1)",
          }}
        >
          <strong>Pregunta:</strong> {formatPregunta(pregunta.texto)}
          {respuesta && (
            <>
              <br />
              <strong>Respuesta:</strong> {formatRespuesta(respuesta.texto)}
            </>
          )}
          <br />
          <strong>Valor:</strong> {valorTexto}
        </div>
      );
    })}
</div>

    </div>
  );
}
