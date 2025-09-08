import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Home() {
  const cuadros = [
    { id: 1, label: "Total de mensajes", color: "#FF6B6B" },
    { id: 2, label: "Cantidad de conversacions Completadas", color: "#4ECDC4" },
    { id: 3, label: "Cantidad Conversaciones Activas", color: "#556270" },
    { id: 4, label: "Cantidad de creditos ingresados", color: "#bf64f4ff" },
    { id: 5, label: "Mejores Perfilamientos", color: "#FF6B6B" },
    { id: 6, label: "Grafica semanal", color: "#4ECDC4" },
    { id: 7, label: "Colaboradores", color: "#556270" },
    { id: 8, label: "¿¿¿??? ", color: "#bf64f4ff" },
    { id: 9, label: "Citas Pendientes", color: "#FF6B6B" },
    { id: 10, label: "Resumen Semanal", color: "#4ECDC4" },
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

  return (
    <div style={{ padding: "20px" }}>
      {/* Primera fila: 4 cuadros */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        {cuadros.slice(0, 4).map((c) => (
          <div
            key={c.id}
            style={{
              flex: 1,
              height: "200px",
              backgroundColor: c.color,
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "18px",
            }}
          >
            {c.label}
          </div>
        ))}
      </div>

      {/* Segunda fila: 2 cuadros */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        {cuadros.slice(4, 6).map((c) => (
          <div
            key={c.id}
            style={{
              flex: 1,
              height: "400px",
              backgroundColor: c.color,
              borderRadius: "10px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {c.label === "Grafica semanal" ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="mensajes" stroke="#8884d8" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ color: "#fff", fontWeight: "bold", fontSize: "18px", margin: "auto" }}>
                {c.label}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tercera fila: 4 cuadros */}
      <div style={{ display: "flex", gap: "20px" }}>
        {cuadros.slice(6, 10).map((c) => (
          <div
            key={c.id}
            style={{
              flex: 1,
              height: "200px",
              backgroundColor: c.color,
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "18px",
            }}
          >
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}
