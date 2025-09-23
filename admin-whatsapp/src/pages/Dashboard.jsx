// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../components/dashboard/StatCard";
import WeeklyChart from "../components/dashboard/WeeklyChart";
import { useTheme } from "../context/ThemeContext";
import { UsersApi } from "../api/users";
import { getAppointments } from "../api/appointments";

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
  const [appointments, setAppointments] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [users, setUsers] = useState([]);

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

  // ---- Conversaciones + Mejores Perfilamientos ----
  useEffect(() => {
    if (!conversations.length) return;

    const finalizadas = conversations.filter(c => c.status === "finish");
    setTotalConversaciones(finalizadas.length);

    const activas = conversations.filter(c => c.status === "active");
    setTotalConversacionesActivas(activas.length);

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

    const normalize = str =>
      !str ? "" : String(str).toLowerCase().replace(/\s/g, "").replace(/,/g, "").replace(/\$/g, "").replace(/–|-/g, "-");

    const calculatePoints = (answers = []) =>
      answers.reduce((sum, a) => {
        const key = a.question_key ?? a.question?.key ?? "";
        const answerValue = a.answer_value ?? a.value ?? a.answer ?? "";
        const options = ponderacionMap[key] || [];
        const matchedOption = options.find(opt => normalize(opt.label) === normalize(answerValue));
        return sum + (matchedOption?.points || 0);
      }, 0);

    const scoreRanges = [
      { min: 0, max: 50, color: "bg-red-500", label: "Malo" },
      { min: 51, max: 100, color: "bg-yellow-400", label: "Regular" },
      { min: 101, max: 140, color: "bg-green-400", label: "Bien" },
      { min: 141, max: 170, color: "bg-sky-300", label: "Excelente" },
    ];
    const getRange = totalPoints => scoreRanges.find(r => totalPoints >= r.min && totalPoints <= r.max) || { label: "Malo", color: "bg-red-500" };

    const profiles = conversations.map(conv => {
      const points = calculatePoints(conv.answers || []);
      const range = getRange(points);
      return {
        id: conv.id,
        name: conv.customer_name || conv.customer?.full_name || "Sin nombre",
        points,
        label: range.label,
        color: range.color,
      };
    });
    setTopProfiles(profiles);
  }, [conversations]);

  // ---- WeeklyMessages ----
  useEffect(() => {
    if (!weekRange.start || !weekRange.end || customers.length === 0) return;

    const startDate = new Date(weekRange.start.split("-").reverse().join("-"));
    const endDate = new Date(weekRange.end.split("-").reverse().join("-"));

    const days = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
    const counts = Array(7).fill(0);

    customers.forEach(c => {
      if(!c.last_interaction) return;
      const msgDate = new Date(c.last_interaction);
      if(msgDate >= startDate && msgDate <= endDate){
        const dayIdx = (msgDate.getDay() + 6) % 7;
        counts[dayIdx] += 1;
      }
    });

    const chartData = days.map((name, i) => ({ name, mensajes: counts[i] }));
    setWeeklyMessages(chartData);
  }, [customers, weekRange]);

  // ---- Fetch users ----
    useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await UsersApi.list();
        // asumimos que la API devuelve { data: [...] }
        setUsers(res.data || []);
        const res = await UsersApi.list();
        // asumimos que la API devuelve { data: [...] }
        setUsers(res.data || []);
      } catch (err) {
        console.error(err);
        setUsers([]); // fallback por si falla
      }
    };
    fetchUsers();
  }, []);


  // ---- Fetch appointments ----
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await getAppointments();
        setAppointments(data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAppointments();
  }, []);

    // ---- Procesar citas ----
  useEffect(() => {
    if (!appointments.length || !customers.length) return;
    const today = new Date();

    const formatAppointment = appt => {
      const customer = customers.find(c=>c.id===appt.customer_id);
      return `${customer?.full_name || "Sin nombre"}\n${new Date(appt.date).toISOString().split("T")[0]} ${appt.time_start}`;
    };

    const sortAppointments = arr => arr.sort((a,b)=>{
      const [h1,m1,s1]=a.time_start.split(":").map(Number);
      const [h2,m2,s2]=b.time_start.split(":").map(Number);
      const dA = new Date(a.date); dA.setHours(h1,m1,s1,0);
      const dB = new Date(b.date); dB.setHours(h2,m2,s2,0);
      return dA-dB;
    });

    setTodayAppointments(sortAppointments(appointments.filter(a=>{
      if(a.status.toLowerCase()!=="confirmed") return false;
      const d = new Date(a.date);
      return d.getFullYear()===today.getFullYear() && d.getMonth()===today.getMonth() && d.getDate()===today.getDate();
    })).map(formatAppointment));

    setUpcomingAppointments(sortAppointments(appointments.filter(a=>{
      if(a.status.toLowerCase()!=="confirmed") return false;
      const d = new Date(a.date);
      return !(d.getFullYear()===today.getFullYear() && d.getMonth()===today.getMonth() && d.getDate()===today.getDate());
    })).map(formatAppointment));

  }, [appointments, customers]);

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
        <div className="flex-1 flex flex-col">
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
        <StatCard title="Colaboradores" darkMode={darkMode} className="flex-1 flex flex-col">
          {users.length === 0 ? (
            <div className="text-sm opacity-70 text-center flex-1 flex items-center justify-center">
              No hay colaboradores
            </div>
          ) : (
            <div className={`flex flex-col gap-1 p-2 rounded-md ${darkMode ? "bg-[#2a2a2a]" : "bg-gray-50"} flex-1 overflow-auto`}>
              {users.map((u) => (
                <div
                  key={u.id}
                  onClick={() => navigate("/users")}
                  className={`flex justify-between items-center px-3 py-2 rounded-md cursor-pointer transition-all duration-200 ${
                    darkMode ? "hover:bg-[#3a3a3a]" : "hover:bg-gray-100"
                  }`}
                >
                  <span className="font-medium truncate">{u.nombre} {u.apellido}</span>
                  <span className="text-xs opacity-70">{u.email}</span>
                </div>
              ))}
            </div>
          )}
        </StatCard>

        <StatCard title="Citas de hoy" darkMode={darkMode} className="flex-1 flex flex-col">
          {todayAppointments.length === 0 ? (
            <div className="text-sm opacity-70 text-center flex-1 flex items-center justify-center">
              No hay citas hoy
            </div>
          ) : (
            <div className={`flex flex-col gap-1 p-2 rounded-md ${darkMode ? "bg-[#2a2a2a]" : "bg-gray-50"} flex-1 overflow-auto`}>
              {todayAppointments.map((appt, i) => (
                <div key={i} className="flex justify-between items-center px-3 py-2 rounded-md">
                  {appt}
                </div>
              ))}
            </div>
          )}
        </StatCard>

        <StatCard title="Próximas citas" darkMode={darkMode} className="flex-1 flex flex-col">
          {upcomingAppointments.length === 0 ? (
            <div className="text-sm opacity-70 text-center flex-1 flex items-center justify-center">
              No hay próximas citas
            </div>
          ) : (
            <div className={`flex flex-col gap-1 p-2 rounded-md ${darkMode ? "bg-[#2a2a2a]" : "bg-gray-50"} flex-1 overflow-auto`}>
              {upcomingAppointments.map((appt, i) => (
                <div key={i} className="flex justify-between items-center px-3 py-2 rounded-md">
                  {appt}
                </div>
              ))}
            </div>
          )}
        </StatCard>
        <StatCard title="Resumen Semanal" darkMode={darkMode} />
      </div>
    </div>
  );
}
