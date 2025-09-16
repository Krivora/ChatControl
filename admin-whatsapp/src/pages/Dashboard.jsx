import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard({ darkMode }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const cuadros = [
    { id: 1, label: "Total de mensajes" },
    { id: 2, label: "Conversaciones Completadas" },
    { id: 3, label: "Conversaciones Activas" },
    { id: 4, label: "Créditos ingresados" },
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

  const baseCard =
    "flex flex-col justify-center items-center rounded-xl shadow-md transition-all duration-300 p-5 font-roboto";

  return (
    <div
      className={`min-h-screen p-5 ${
        darkMode ? "bg-[#121212] text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Primera fila */}
      <div
        className={`flex ${
          isMobile ? "flex-col" : "flex-row"
        } gap-5 mb-5 w-full`}
      >
        {cuadros.slice(0, 4).map((c) => (
          <div
            key={c.id}
            className={`${baseCard} flex-1 ${
              darkMode ? "bg-[#2a2a2a]" : "bg-white"
            }`}
          >
            {c.label === "Total de mensajes" ? (
              <>
                <div className="text-3xl font-bold mb-2">{totalMensajes}</div>
                <div className="text-lg font-medium text-center">
                  Total de mensajes
                </div>
                <div className="text-xs mt-1 text-center opacity-80">
                  Periodo: 07-02-2025 a 13-02-2025
                </div>
              </>
            ) : (
              <div className="text-lg font-semibold text-center">{c.label}</div>
            )}
          </div>
        ))}
      </div>

      {/* Segunda fila */}
      <div
        className={`flex ${
          isMobile ? "flex-col" : "flex-row"
        } gap-5 mb-5 w-full`}
      >
        {cuadros.slice(4, 6).map((c) => (
          <div
            key={c.id}
            className={`${baseCard} ${
              darkMode ? "bg-[#2a2a2a]" : "bg-white"
            } ${isMobile ? "min-h-[250px]" : "min-h-[400px]"} flex-1`}
          >
            {c.label === "Gráfica semanal" ? (
              <ResponsiveContainer
                width="100%"
                height={isMobile ? 250 : "100%"}
              >
                <LineChart data={data}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={darkMode ? "#444" : "#ccc"}
                  />
                  <XAxis
                    dataKey="name"
                    stroke={darkMode ? "#fff" : "#000"}
                  />
                  <YAxis stroke={darkMode ? "#fff" : "#000"} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? "#2a2a2a" : "#fff",
                      color: darkMode ? "#fff" : "#000",
                      border: "none",
                    }}
                  />
                  <Legend wrapperStyle={{ color: darkMode ? "#fff" : "#000" }} />
                  <Line
                    type="monotone"
                    dataKey="mensajes"
                    stroke={darkMode ? "#fff" : "#000"}
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div
                className={`font-semibold ${
                  isMobile ? "text-base" : "text-lg"
                }`}
              >
                {c.label}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tercera fila */}
      <div
        className={`flex ${
          isMobile ? "flex-col" : "flex-row"
        } gap-5 w-full`}
      >
        {cuadros.slice(6, 10).map((c) => (
          <div
            key={c.id}
            className={`${baseCard} flex-1 ${
              darkMode ? "bg-[#2a2a2a]" : "bg-white"
            } text-lg font-semibold min-h-[150px]`}
          >
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}
