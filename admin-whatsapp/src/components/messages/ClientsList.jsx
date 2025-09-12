import React from "react";

export default function ClientsList({ clients, selectedClient, setSelectedClient, darkMode, setSelectedClientState }) {
  const isMobile = window.innerWidth < 768; // Detecta móvil

  // Map de puntajes
  const puntajesMap = {
    pregunta_buro_credito: { mal: 5, regular: 15, bien: 30, excelente: 50 },
    pregunta_pago_inicial: {
      "$30,000 - $50,000": 15,
      "$50,000 - $70,000": 15,
      "$70,000 - $100,000": 20,
      "$100,000 - $200,000": 25,
      "$200,000 o más": 25,
    },
    pregunta_cuota_mensual: {
      "$4,000 - $5,500": 25,
      "$5,500 - $7,000": 25,
      "$7,000 - $9,000": 25,
      "$9,000 o más": 25,
    },
    pregunta_tiempo_estreno: {
      "Ya estoy listo": 70,
      "De 1 a 15 días": 15,
      "De 15 a 30 días": 10,
      "Más de 30 días": 5,
    },
  };

  // Mapea claves de puntaje a campos reales del cliente
  const clientKeyMap = {
    pregunta_buro_credito: "historial_crediticio",
    pregunta_pago_inicial: "pago_inicial",
    pregunta_cuota_mensual: "cuota_mensual_maxima",
    pregunta_tiempo_estreno: "tiempo_estreno",
  };

  // Máximo puntaje posible
  const maxPuntos = Object.values(puntajesMap).reduce(
    (acc, cur) => acc + Math.max(...Object.values(cur).map(v => (typeof v === "number" ? v : 0))),
    0
  );

  // Normaliza string
  const normalize = (str) => str?.trim().replace(/–/g, "-").toLowerCase();

  // Semáforo según porcentaje
  const getSemaforo = (porcentaje) => {
    if (porcentaje >= 70) return "green";
    if (porcentaje >= 40) return "yellow";
    return "red";
  };

  return (
    <div
      style={{
        background: darkMode ? "#222" : "#f4f4f4",
        borderRadius: "8px",
        padding: "1rem",
        height: "auto",
        maxHeight: "80vh",
        overflowY: "auto",
        width: "100%",
        boxSizing: "border-box",
        display: isMobile && selectedClient ? "none" : "block",
      }}
    >
      <h3
        style={{
          color: darkMode ? "#fff" : "#222",
          fontSize: "1.2rem",
          marginBottom: "0.8rem",
        }}
      >
        Clientes
      </h3>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {clients.map((client) => {
          // 🔹 Calcula puntos
          let totalPuntos = 0;

          Object.keys(puntajesMap).forEach((clave) => {
            const clientField = clientKeyMap[clave];
            if (!clientField) return;

            let val = client[clientField];
            if (!val) return;

            if (clave === "pregunta_buro_credito") val = normalize(val);
            else val = val.trim().replace(/–/g, "-");

            totalPuntos += puntajesMap[clave][val] || 0;
          });

          const porcentaje = Math.round((totalPuntos / maxPuntos) * 100);
          const color = getSemaforo(porcentaje);

          return (
            <li
              key={client.id}
              onClick={() => setSelectedClient(client)}
              style={{
                padding: "0.75rem 1rem",
                marginBottom: "0.6rem",
                borderRadius: "6px",
                cursor: "pointer",
                background:
                  selectedClient?.id === client.id
                    ? "#c3002eb7"
                    : darkMode
                    ? "#333"
                    : "#fff",
                color:
                  selectedClient?.id === client.id
                    ? "#fff"
                    : darkMode
                    ? "#fff"
                    : "#222",
                border:
                  selectedClient?.id === client.id
                    ? "2px solid #000000ff"
                    : "1px solid #000000ff",
                transition: "all 0.2s ease",
                fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{client.nombre_completo}</span>
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                {/* Ruedita de color */}
                <span
                  style={{
                    display: "inline-block",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: color,
                  }}
                ></span>
                {/* Puntos y porcentaje */}
                {totalPuntos} pts ({porcentaje}%)
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
