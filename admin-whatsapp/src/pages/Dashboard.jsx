// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../components/dashboard/StatCard";
import WeeklyChart from "../components/dashboard/WeeklyChart";
import TopProfiles from "../components/dashboard/TopProfiles";
import { useTheme } from "../context/ThemeContext";

export default function Dashboard() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [totalClientesSemana, setTotalClientesSemana] = useState(0);
  const [totalConversaciones, setTotalConversaciones] = useState(0);
  const [totalConversacionesActivas, setTotalConversacionesActivas] = useState(0);
  const [weekRange, setWeekRange] = useState({ start: "", end: "" });
  const [topProfiles, setTopProfiles] = useState([]);
  const [weeklyMessages, setWeeklyMessages] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [conversations, setConversations] = useState([]);

  // ---- Resize ----
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ---- Rango de la semana actual ----
  useEffect(() => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diffToMonday));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const format = (d) =>
      `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;

    setWeekRange({ start: format(monday), end: format(sunday) });
  }, []);

  // ---- Fetch clientes ----
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/customers?page=1&pageSize=1000`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        setCustomers(data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchClientes();
  }, []);

  // ---- Fetch conversaciones ----
  useEffect(() => {
    const fetchConversaciones = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/conversations?page=1&pageSize=1000`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        setConversations(data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchConversaciones();
  }, []);

  // ---- Total clientes semana ----
  useEffect(() => {
    if (!weekRange.start || !weekRange.end || customers.length === 0) return;

    const startDate = new Date(weekRange.start.split("-").reverse().join("-"));
    const endDate = new Date(weekRange.end.split("-").reverse().join("-"));

    const clientesSemana = customers.filter(c => {
      const created = new Date(c.created_at);
      return created >= startDate && created <= endDate;
    });

    setTotalClientesSemana(clientesSemana.length);
  }, [weekRange, customers]);

  // ---- Total conversaciones finalizadas y TopProfiles ----
  useEffect(() => {
    if (conversations.length === 0) return;

    const finalizadas = conversations.filter(c => c.status === "finish");
    setTotalConversaciones(finalizadas.length);

    // TopProfiles
    const ponderacionMap = {
      down_payment_max: [
        { label: "$30,000 – $50,000", points: 15 },
        { label: "$50,000 – $70,000", points: 15 },
        { label: "$70,000 – $100,000", points: 20 },
        { label: "$100,000 – $200,000", points: 25 },
        { label: "$200,000 o más", points: 25 },
      ],
      max_monthly_payment: [
        { label: "$4,000 – $5,500", points: 25 },
        { label: "$5,500 – $7,000", points: 25 },
        { label: "$7,000 – $9,000", points: 25 },
        { label: "$9,000 o más", points: 25 },
      ],
      credit_bureau_status: [
        { label: "mal", points: 5 },
        { label: "regular", points: 15 },
        { label: "bien", points: 30 },
        { label: "excelente", points: 50 },
      ],
      time_to_buy: [
        { label: "Ya estoy listo", points: 70 },
        { label: "De 1 a 15 días", points: 15 },
        { label: "De 15 a 30 días", points: 10 },
        { label: "Más de 30 días", points: 5 },
      ],
    };

    const normalize = (str) => !str ? "" : str.toLowerCase().replace(/\s/g,"").replace(/,/g,"").replace(/\$/g,"").replace(/–|-/g,"-");

    const calculatePoints = (answers = []) =>
      answers.reduce((sum, a) => {
        const options = ponderacionMap[a.question_key] || [];
        const matchedOption = options.find(opt => normalize(opt.label) === normalize(a.answer_value));
        return sum + (matchedOption?.points || 0);
      }, 0);

    const scoreRanges = [
      { min: 0, max: 50, color: "bg-red-500", label: "Malo" },
      { min: 51, max: 100, color: "bg-yellow-400", label: "Regular" },
      { min: 101, max: 140, color: "bg-green-400", label: "Bien" },
      { min: 141, max: 170, color: "bg-sky-300", label: "Excelente" },
    ];

    const getRange = (totalPoints) => scoreRanges.find(r => totalPoints >= r.min && totalPoints <= r.max) || {};

    const profiles = conversations.map(conv => {
      const totalPoints = calculatePoints(conv.answers || []);
      const range = getRange(totalPoints);
      return {
        id: conv.id,
        name: conv.customer_name,
        points: totalPoints,
        label: range.label,
        color: range.color,
      };
    });

    setTopProfiles(profiles);
  }, [conversations]);

  // ---- Conversaciones activas ----
  useEffect(() => {
    if (conversations.length === 0) return;
    const activas = conversations.filter(c => c.status === "active");
    setTotalConversacionesActivas(activas.length);
  }, [conversations]);

  // ---- WeeklyMessages (conteo de mensajes por día) ----
  useEffect(() => {
    if (!weekRange.start || !weekRange.end || customers.length === 0) return;

    const startDate = new Date(weekRange.start.split("-").reverse().join("-"));
    const endDate = new Date(weekRange.end.split("-").reverse().join("-"));

    // Nombres de días
    const days = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
    const counts = Array(7).fill(0);

    // Contar cada last_interaction dentro del rango
    customers.forEach(c => {
      if(!c.last_interaction) return;
      const msgDate = new Date(c.last_interaction);
      if(msgDate >= startDate && msgDate <= endDate){
        const dayIdx = (msgDate.getDay() + 6) % 7; // lunes=0
        counts[dayIdx] += 1;
      }
    });

    const chartData = days.map((name, i) => ({ name, mensajes: counts[i] }));
    setWeeklyMessages(chartData);
  }, [customers, weekRange]);


  return (
    <div className={`min-h-screen p-5 ${darkMode ? "bg-[#121212] text-white" : "bg-gray-100 text-gray-900"}`}>
      <div className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-5 mb-5`}>
        <StatCard title="Total de clientes esta semana" value={totalClientesSemana} darkMode={darkMode}>
          <div className="text-xs mt-1 text-center opacity-80">
            Periodo: {weekRange.start} a {weekRange.end}
          </div>
        </StatCard>

        <StatCard title="Conversaciones Completadas" value={totalConversaciones} darkMode={darkMode} />
        <StatCard title="Conversaciones Pendientes" value={totalConversacionesActivas} darkMode={darkMode} />
        <StatCard title="Créditos ingresados" darkMode={darkMode} />
      </div>

        <div className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-5 mb-5`}>
        <div className="flex-1 flex flex-col" >
            <StatCard title="Mejores Perfilamientos" darkMode={darkMode} className="flex-1 flex flex-col">
              {topProfiles.length === 0 ? (
                <div className="text-sm opacity-70 text-center flex-1 flex items-center justify-center">
                  No hay perfilamientos
                </div>
              ) : (
                <div
                  className={`flex flex-col gap-1 p-2 rounded-md ${darkMode ? "bg-[#2a2a2a]" : "bg-gray-50"} flex-1 overflow-auto`}
                >
                  {topProfiles
                    .filter(p => p.label === "Bien" || p.label === "Excelente")
                    .sort((a, b) => b.points - a.points)
                    .map((p, idx) => (
                      <div
                        key={idx}
                        onClick={() => navigate("/messages", { state: { conversationId: p.id } })}
                        className={`flex justify-between items-center px-3 py-2 rounded-md cursor-pointer transition-all duration-200 ${
                          darkMode ? "hover:bg-[#3a3a3a]" : "hover:bg-gray-100"
                        }`}
                      >
                        <span className="font-medium truncate">{p.name}</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-white text-xs font-semibold ${p.color}`}>
                            {p.points} pts
                          </span>
                          <span className="text-xs opacity-70">{p.label}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </StatCard>
          </div>

          <div className="flex-1">
<WeeklyChart data={weeklyMessages} darkMode={darkMode} weekRange={weekRange} />
          </div>
        </div>

      <div className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-5`}>
        <StatCard title="Colaboradores" darkMode={darkMode} />
        <StatCard title="¿¿¿???" darkMode={darkMode} />
        <StatCard title="Citas Pendientes" darkMode={darkMode} />
        <StatCard title="Resumen Semanal" darkMode={darkMode} />
      </div>
    </div>
  );
}
