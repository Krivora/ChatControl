import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import RemoveIcon from "@mui/icons-material/Remove";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";

const nf = new Intl.NumberFormat("es-MX");

const pct = (part, whole) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

// Cambio porcentual contra el periodo anterior del mismo largo. Cuando el
// periodo anterior fue cero no hay porcentaje que calcular: se omite la flecha.
const delta = (current, previous) => {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 100);
};

// El catálogo es fijo para que cada tarjeta conserve su lugar aunque un valor
// llegue en cero.
const buildCards = (summary, previous) => [
  {
    key: "customers_new",
    label: "Clientes nuevos",
    value: summary.customers_new,
    change: delta(summary.customers_new, previous.customers_new),
    icon: <GroupsOutlinedIcon fontSize="small" />,
  },
  {
    key: "conversations_started",
    label: "Conversaciones",
    value: summary.conversations_started,
    hint: `${nf.format(summary.conversations_active)} activas`,
    change: delta(summary.conversations_started, previous.conversations_started),
    icon: <ForumOutlinedIcon fontSize="small" />,
  },
  {
    key: "conversations_finished",
    label: "Perfilamientos completados",
    value: summary.conversations_finished,
    hint: `${pct(summary.conversations_finished, summary.conversations_started)}% de las conversaciones`,
    change: delta(summary.conversations_finished, previous.conversations_finished),
    icon: <TaskAltOutlinedIcon fontSize="small" />,
  },
  {
    key: "assignments_total",
    label: "Asignaciones",
    value: summary.assignments_total,
    hint: `${nf.format(summary.assignments_in_progress)} en proceso`,
    change: delta(summary.assignments_total, previous.assignments_total),
    icon: <AssignmentOutlinedIcon fontSize="small" />,
  },
  {
    key: "appointments_total",
    label: "Citas agendadas",
    value: summary.appointments_total,
    hint: `${nf.format(summary.appointments_completed)} completadas · ${nf.format(
      summary.appointments_cancelled
    )} canceladas`,
    change: delta(summary.appointments_total, previous.appointments_total),
    icon: <CalendarMonthOutlinedIcon fontSize="small" />,
  },
  {
    key: "conversion",
    label: "Conversión a cita",
    value: `${pct(summary.appointments_total, summary.conversations_started)}%`,
    hint: "Citas por conversación iniciada",
    change: null,
    icon: <PercentOutlinedIcon fontSize="small" />,
  },
];

function DeltaBadge({ change, darkMode }) {
  if (change === null || change === undefined) return null;

  const up = change > 0;
  const flat = change === 0;
  // Verde/rojo de estado, siempre acompañados de icono y del número: el color
  // nunca carga solo el significado.
  const tone = flat
    ? darkMode
      ? "text-gray-400"
      : "text-gray-500"
    : up
    ? "text-[#0ca30c]"
    : "text-[#d03b3b]";
  const Icon = flat ? RemoveIcon : up ? ArrowUpwardIcon : ArrowDownwardIcon;

  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${tone}`}>
      <Icon style={{ fontSize: 14 }} />
      {Math.abs(change)}%
    </span>
  );
}

export default function KpiGrid({ summary, previousSummary, darkMode }) {
  if (!summary) return null;
  const cards = buildCards(summary, previousSummary || {});

  const shell = darkMode
    ? "bg-[#1a1a1a] border-gray-800"
    : "bg-white border-gray-100";

  return (
    <div className="report-kpis grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className={`rounded-2xl border shadow-sm p-5 transition-shadow hover:shadow-md ${shell}`}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs uppercase tracking-wide text-gray-400 leading-snug">
              {card.label}
            </p>
            <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#960b2b]/10 text-[#960b2b] flex items-center justify-center">
              {card.icon}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-3">
            <p className={`text-3xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
              {typeof card.value === "number" ? nf.format(card.value) : card.value}
            </p>
            <DeltaBadge change={card.change} darkMode={darkMode} />
          </div>

          <p className="text-xs text-gray-400 mt-1">
            {card.hint || "vs. periodo anterior"}
          </p>
        </div>
      ))}
    </div>
  );
}
