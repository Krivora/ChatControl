import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Home({ darkMode }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const cuadros = [
    { id: 1, label: "Total de mensajes" },
    { id: 2, label: "Cantidad de conversaciones Completadas" },
    { id: 3, label: "Cantidad Conversaciones Activas" },
    { id: 4, label: "Cantidad de créditos ingresados" },
    { id: 5, label: "Mejores Perfilamientos" },
    { id: 6, label: "Gráfica semanal" },
    { id: 7, label: "Colaboradores" },
    { id: 8, label: "¿¿¿??? " },
    { id: 9, label: "Citas Pendientes" },
    { id: 10, label: "Resumen Semanal" },
  ];

  const data = [
    { name: "Lun", mensajes: 400 },
    { name: "Mar", mensajes: 300 },
    { name: "Mié", mensajes: 500 },
    { name: "Jue", mensajes: 200 },
    { name: "Vie", mensajes: 400 },
    { name: "Sáb", mensajes: 300 },
    { name: "Dom", mensajes: 450 },
  ];

  const totalMensajes = data.reduce((sum, item) => sum + item.mensajes, 0);

  const cardStyle = {
    flex: 1,
    borderRadius: "15px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: darkMode ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.1)",
    transition: "all 0.3s",
    backgroundColor: darkMode ? "#2a2a2a" : "#fff",
    color: darkMode ? "#fff" : "#000",
    fontFamily: "'Roboto', sans-serif",
    minHeight: "150px",
  };

  const containerStyle = {
    padding: "20px",
    backgroundColor: darkMode ? "#121212" : "#f5f6fa",
    minHeight: "100vh",
  };

  return (
    <div style={containerStyle}>
      {/* Primera fila */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        {cuadros.slice(0, 4).map((c) => (
          <div key={c.id} style={cardStyle}>
            {c.label === "Total de mensajes" ? (
              <>
                <div style={{ fontSize: "26px", fontWeight: "700", marginBottom: "8px" }}>
                  {totalMensajes}
                </div>
                <div style={{ fontSize: "16px", fontWeight: "500", textAlign: "center" }}>
                  Total de mensajes
                </div>
                <div style={{ fontSize: "12px", fontWeight: "400", marginTop: "5px", textAlign: "center" }}>
                  Periodo: 07-02-2025 a 13-02-2025 por semana
                </div>
              </>
            ) : (
              <div style={{ fontSize: "18px", fontWeight: "600", textAlign: "center" }}>{c.label}</div>
            )}
          </div>
        ))}
      </div>

      {/* Segunda fila */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        {cuadros.slice(4, 6).map((c) => (
          <div key={c.id} style={{ ...cardStyle, minHeight: isMobile ? "250px" : "400px", padding: "15px" }}>
            {c.label === "Gráfica semanal" ? (
              <ResponsiveContainer width="100%" height={isMobile ? 250 : "100%"}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#444" : "#ccc"} />
                  <XAxis dataKey="name" stroke={darkMode ? "#fff" : "#000"} />
                  <YAxis stroke={darkMode ? "#fff" : "#000"} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? "#2a2a2a" : "#fff",
                      color: darkMode ? "#fff" : "#000",
                      border: "none",
                    }}
                  />
                  <Legend wrapperStyle={{ color: darkMode ? "#fff" : "#000" }} />
                  <Line type="monotone" dataKey="mensajes" stroke={darkMode ? "#fff" : "#000"} strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ fontSize: isMobile ? "16px" : "20px", fontWeight: "600" }}>{c.label}</div>
            )}
          </div>
        ))}
      </div>

      {/* Tercera fila */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: "20px",
        }}
      >
        {cuadros.slice(6, 10).map((c) => (
          <div key={c.id} style={{ ...cardStyle, fontSize: "18px", fontWeight: "600", minHeight: "150px" }}>
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}
