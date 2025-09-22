import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import StatCard from "../components/dashboard/StatCard";
import WeeklyChart from "../components/dashboard/WeeklyChart";
import StatsRow from "../components/dashboard/StatsRow";
import TopProfiles from "../components/dashboard/TopProfiles";

export default function Dashboard() {
  const { darkMode } = useTheme();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [totalClientesSemana, setTotalClientesSemana] = useState(0);
  const [totalConversaciones, setTotalConversaciones] = useState(0);
  const [totalConversacionesActivas, setTotalConversacionesActivas] = useState(0);
  const [weekRange, setWeekRange] = useState({ start: "", end: "" });
  const [topProfiles, setTopProfiles] = useState([]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ---- Calcular rango de la semana actual ----
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

  // ---- Fetch de clientes de la semana ----
  useEffect(() => {
    const fetchClientesSemana = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/customers?page=1&pageSize=1000`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        const clientes = data.data || [];

        const startDate = new Date(weekRange.start.split("-").reverse().join("-"));
        const endDate = new Date(weekRange.end.split("-").reverse().join("-"));

        const clientesSemana = clientes.filter(c => {
          const created = new Date(c.created_at);
          return created >= startDate && created <= endDate;
        });

        setTotalClientesSemana(clientesSemana.length);
      } catch (err) {
        console.error(err);
      }
    };

    if (weekRange.start && weekRange.end) fetchClientesSemana();
  }, [weekRange]);

  // ---- Fetch de conversaciones ----
  useEffect(() => {
    const fetchConversaciones = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/conversations?page=1&pageSize=1000`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        const conversaciones = data.data || [];

        // Conversaciones finalizadas
        const finalizadas = conversaciones.filter(c => c.status === "finish");
        setTotalConversaciones(finalizadas.length);

        // Conversaciones activas
        const activas = conversaciones.filter(c => c.status === "active");
        setTotalConversacionesActivas(activas.length);

        // Top perfiles
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

        function normalize(str) {
          if (!str) return "";
          return str.toLowerCase().replace(/\s/g, "").replace(/,/g, "").replace(/\$/g, "").replace(/–|-/g, "-");
        }

        function calculatePoints(answers = []) {
          return answers.reduce((sum, a) => {
            const options = ponderacionMap[a.question_key] || [];
            const matchedOption = options.find(opt => normalize(opt.label) === normalize(a.answer_value));
            return sum + (matchedOption?.points || 0);
          }, 0);
        }

        const scoreRanges = [
          { min: 0, max: 50, color: "bg-red-500", label: "Malo" },
          { min: 51, max: 100, color: "bg-yellow-400", label: "Regular" },
          { min: 101, max: 140, color: "bg-green-400", label: "Bien" },
          { min: 141, max: 170, color: "bg-sky-300", label: "Excelente" },
        ];

        function getRange(totalPoints) {
          return scoreRanges.find(r => totalPoints >= r.min && totalPoints <= r.max) || {};
        }

        const profiles = conversaciones.map(conv => {
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
      } catch (err) {
        console.error(err);
      }
    };

    fetchConversaciones();
  }, []);

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
    <div className={`min-h-screen p-5 ${darkMode ? "bg-[#121212] text-white" : "bg-gray-100 text-gray-900"}`}>
      <StatsRow isMobile={isMobile}>
        <StatCard title="Total de clientes esta semana" value={totalClientesSemana} darkMode={darkMode}>
          <div className="text-xs mt-1 text-center opacity-80">
            Periodo: {weekRange.start} a {weekRange.end}
          </div>
        </StatCard>
        <StatCard title="Conversaciones Completadas" value={totalConversaciones} darkMode={darkMode} />
        <StatCard title="Conversaciones Pendientes" value={totalConversacionesActivas} darkMode={darkMode} />
        <StatCard title="Créditos ingresados" darkMode={darkMode} />
      </StatsRow>

      <StatsRow isMobile={isMobile}>
        <StatCard title="Mejores Perfilamientos" darkMode={darkMode}>
          <TopProfiles topProfiles={topProfiles} darkMode={darkMode} />
        </StatCard>
        <WeeklyChart data={data} darkMode={darkMode} />
      </StatsRow>

      <StatsRow isMobile={isMobile}>
        <StatCard title="Colaboradores" darkMode={darkMode} />
        <StatCard title="¿¿¿???" darkMode={darkMode} />
        <StatCard title="Citas Pendientes" darkMode={darkMode} />
        <StatCard title="Resumen Semanal" darkMode={darkMode} />
      </StatsRow>
    </div>
  );
}
