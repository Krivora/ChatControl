// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../components/dashboard/StatCard";
import WeeklyChart from "../components/dashboard/WeeklyChart";
import { useTheme } from "../context/ThemeContext";
import { UsersApi } from "../api/users";
import { AppointmentsApi } from "../api/appointments";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import CreditScoreOutlinedIcon from "@mui/icons-material/CreditScoreOutlined";
import { calculatePoints, getRange, initials, MAX_SCORE } from "../utils/scoring";

// Citas que siguen "vivas": las canceladas, completadas y no-show no cuentan
// como próximas.
const UPCOMING_STATUSES = ["pending", "confirmed", "in_progress", "rescheduled"];

// Día local en formato YYYY-MM-DD. Comparar cadenas evita los corrimientos
// de zona horaria que produce toISOString().
const toLocalDay = (value) => {
  const d = new Date(value);
  if (isNaN(d)) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

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

    // Las respuestas llegan con nombres distintos según el endpoint; se
    // normalizan antes de puntuar con la tabla compartida.
    const toAnswer = (a) => ({
      question_key: a.question_key ?? a.question?.key ?? "",
      answer_value: a.answer_value ?? a.value ?? a.answer ?? "",
    });

    const profiles = conversations.map(conv => {
      const points = calculatePoints((conv.answers || []).map(toAnswer));
      const range = getRange(points);
      return {
        id: conv.id,
        name: conv.customer_name || conv.customer?.full_name || "Sin nombre",
        points,
        label: range.label,
        bar: range.bar,
        chip: range.chip,
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
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);


  // ---- Fetch appointments ----
  // Se piden solo las de hoy en adelante y con status vigente: el backend
  // pagina en 20 por defecto ordenando por fecha ascendente, así que sin
  // filtros solo llegaban las más viejas del histórico.
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await AppointmentsApi.list({
          statuses: UPCOMING_STATUSES.join(","),
          dateFrom: toLocalDay(new Date()),
          order: "asc",
          pageSize: 100,
        });
        setAppointments(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAppointments();
  }, []);

    // ---- Procesar citas ----
  useEffect(() => {
    const today = toLocalDay(new Date());

    // `customer_name` ya viene resuelto por el backend; buscarlo en la lista
    // de customers fallaba porque esa también llega paginada.
    const formatAppointment = (appt) => ({
      id: appt.id,
      name: appt.customer_name || "Sin nombre",
      day: toLocalDay(appt.date),
      time: String(appt.time_start || "").slice(0, 5),
    });

    const key = (a) => `${toLocalDay(a.date)} ${a.time_start}`;
    const sorted = [...appointments].sort((a, b) => key(a).localeCompare(key(b)));

    setTodayAppointments(
      sorted.filter((a) => toLocalDay(a.date) === today).map(formatAppointment)
    );

    setUpcomingAppointments(
      sorted.filter((a) => toLocalDay(a.date) > today).map(formatAppointment)
    );
  }, [appointments]);

  const emptyState = (texto) => (
    <div className="flex-1 flex items-center justify-center py-8 text-sm text-gray-400">
      {texto}
    </div>
  );

  const rowHover = darkMode ? "hover:bg-[#242424]" : "hover:bg-gray-50";

  const AppointmentItem = ({ appt }) => (
    <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#960b2b]/10 border border-[#960b2b]/20 flex items-center justify-center text-xs font-bold text-[#960b2b]">
        {appt.time}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{appt.name}</p>
        <p className="text-xs text-gray-400">{appt.day}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Clientes esta semana"
          value={totalClientesSemana}
          hint={weekRange.start ? `${weekRange.start} a ${weekRange.end}` : undefined}
          icon={<GroupsOutlinedIcon fontSize="small" />}
          darkMode={darkMode}
        />
        <StatCard
          label="Conversaciones completadas"
          value={totalConversaciones}
          icon={<TaskAltOutlinedIcon fontSize="small" />}
          darkMode={darkMode}
        />
        <StatCard
          label="Conversaciones pendientes"
          value={totalConversacionesActivas}
          icon={<ForumOutlinedIcon fontSize="small" />}
          darkMode={darkMode}
        />
        <StatCard
          label="Créditos ingresados"
          value={null}
          hint="Sin datos aún"
          icon={<CreditScoreOutlinedIcon fontSize="small" />}
          darkMode={darkMode}
        />
      </div>

      {/* Perfilamientos + gráfica */}
      <div className={`grid gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}>
        <StatCard
          title="Mejores perfilamientos"
          darkMode={darkMode}
          className="min-h-[300px]"
        >
          {topProfiles.filter(p => p.label === "Bien" || p.label === "Excelente").length === 0
            ? emptyState("No hay perfilamientos")
            : (
              <div className="flex flex-col gap-0.5 max-h-[260px] overflow-y-auto scrollbar-hidden">
                {topProfiles
                  .filter(p => p.label === "Bien" || p.label === "Excelente")
                  .sort((a, b) => b.points - a.points)
                  .map((p) => (
                    <button
                      key={p.id}
                      onClick={() => navigate("/messages", { state: { conversationId: p.id } })}
                      className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${rowHover}`}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#960b2b] flex items-center justify-center text-white text-[10px] font-semibold">
                        {initials(p.name)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`h-1.5 flex-1 rounded-full overflow-hidden ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                            <div
                              className={`h-full rounded-full ${p.bar}`}
                              style={{ width: `${Math.min(100, (p.points / MAX_SCORE) * 100)}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-gray-400 flex-shrink-0">{p.points} pts</span>
                        </div>
                      </div>

                      <span className={`flex-shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${p.chip}`}>
                        {p.label}
                      </span>
                    </button>
                  ))}
              </div>
            )}
        </StatCard>

        <WeeklyChart data={weeklyMessages} darkMode={darkMode} weekRange={weekRange} />
      </div>

      {/* Colaboradores + citas */}
      <div className={`grid gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-3"}`}>
        <StatCard title="Colaboradores" darkMode={darkMode} className="min-h-[240px]">
          {users.length === 0
            ? emptyState("No hay colaboradores")
            : (
              <div className="flex flex-col gap-0.5 max-h-[200px] overflow-y-auto scrollbar-hidden">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => navigate("/users")}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${rowHover}`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                      darkMode ? "bg-[#2a2a2a] text-gray-300" : "bg-gray-200 text-gray-600"
                    }`}>
                      {initials(`${u.nombre} ${u.apellido}`)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{u.nombre} {u.apellido}</p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
        </StatCard>

        <StatCard title="Citas de hoy" darkMode={darkMode} className="min-h-[240px]">
          {todayAppointments.length === 0
            ? emptyState("No hay citas hoy")
            : (
              <div className="flex flex-col gap-0.5 max-h-[200px] overflow-y-auto scrollbar-hidden">
                {todayAppointments.map((appt) => (
                  <AppointmentItem key={appt.id} appt={appt} />
                ))}
              </div>
            )}
        </StatCard>

        <StatCard title="Próximas citas" darkMode={darkMode} className="min-h-[240px]">
          {upcomingAppointments.length === 0
            ? emptyState("No hay próximas citas")
            : (
              <div className="flex flex-col gap-0.5 max-h-[200px] overflow-y-auto scrollbar-hidden">
                {upcomingAppointments.map((appt) => (
                  <AppointmentItem key={appt.id} appt={appt} />
                ))}
              </div>
            )}
        </StatCard>
      </div>
    </div>
  );
}
