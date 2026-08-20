// Arma el libro de Excel del resumen: una hoja por bloque del tablero, con
// los mismos números que se ven en pantalla.
import {
  FUNNEL_STAGES,
  APPOINTMENT_LABELS,
  CONVERSATION_LABELS,
  translateLabels,
} from "./reportLabels";

const share = (part, whole) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

const change = (current, previous) =>
  previous ? Math.round(((current - previous) / previous) * 100) : null;

// Cada KPI se exporta con su valor del periodo anterior y su variación: es lo
// que muestran las tarjetas y lo primero que se pregunta al ver un número.
const SUMMARY_ROWS = [
  { key: "customers_new", label: "Clientes nuevos" },
  { key: "conversations_started", label: "Conversaciones iniciadas" },
  { key: "conversations_finished", label: "Conversaciones finalizadas" },
  { key: "conversations_active", label: "Conversaciones activas" },
  { key: "conversations_profiled", label: "Conversaciones con perfilamiento" },
  { key: "assignments_total", label: "Asignaciones" },
  { key: "assignments_in_progress", label: "Asignaciones en proceso" },
  { key: "appointments_total", label: "Citas agendadas" },
  { key: "appointments_completed", label: "Citas completadas" },
  { key: "appointments_cancelled", label: "Citas canceladas" },
  { key: "appointments_pending", label: "Citas pendientes" },
  { key: "messages_total", label: "Mensajes totales" },
  { key: "messages_in", label: "Mensajes del cliente" },
  { key: "messages_out", label: "Mensajes del bot y asesores" },
];

const ADVISOR_COLUMNS = [
  { key: "asesor", label: "Asesor" },
  { key: "email", label: "Email" },
  { key: "role_name", label: "Rol" },
  { key: "asignaciones", label: "Asignados" },
  { key: "en_proceso", label: "En proceso" },
  { key: "aprobados", label: "Aprobados" },
  { key: "vendidos", label: "Vendidos" },
  { key: "rechazados", label: "Rechazados" },
  { key: "descartados", label: "Descartados" },
  { key: "citas", label: "Citas" },
  { key: "citas_completadas", label: "Citas completadas" },
  { key: "efectividad", label: "Efectividad %" },
];

export const buildSummaryWorkbook = (data, range) => {
  const summary = data.summary || {};
  const previous = data.previousSummary || {};

  const kpis = SUMMARY_ROWS.map((row) => ({
    metrica: row.label,
    actual: summary[row.key] ?? 0,
    anterior: previous[row.key] ?? 0,
    variacion: change(summary[row.key] ?? 0, previous[row.key] ?? 0),
  }));

  const stages = FUNNEL_STAGES.map((stage, i) => {
    const value = data.funnel?.[stage.key] ?? 0;
    const first = data.funnel?.[FUNNEL_STAGES[0].key] ?? 0;
    const prev = i > 0 ? data.funnel?.[FUNNEL_STAGES[i - 1].key] ?? 0 : null;
    return {
      etapa: stage.label,
      total: value,
      del_inicio: share(value, first),
      de_la_anterior: prev === null ? null : share(value, prev),
    };
  });

  const qualityTotal = (data.quality || []).reduce((s, q) => s + q.total, 0);

  // Los tres desgloses de estatus caben en una hoja con una columna que dice
  // de qué son: separarlos en tres hojas casi vacías estorba más de lo que ayuda.
  const statuses = [
    ...translateLabels(data.status?.conversations, CONVERSATION_LABELS).map((r) => ({
      tipo: "Conversaciones",
      ...r,
    })),
    ...(data.status?.assignments || []).map((r) => ({ tipo: "Asignaciones", ...r })),
    ...translateLabels(data.status?.appointments, APPOINTMENT_LABELS).map((r) => ({
      tipo: "Citas",
      ...r,
    })),
  ];

  const advisors = (data.advisors || [])
    .filter((a) => a.asignaciones > 0 || a.citas > 0)
    .map((a) => ({
      ...a,
      asesor: `${a.nombre ?? ""} ${a.apellido ?? ""}`.trim(),
      efectividad: share(a.aprobados + a.vendidos, a.asignaciones),
    }));

  return [
    {
      name: "Resumen",
      columns: [
        { key: "metrica", label: "Métrica" },
        { key: "actual", label: `Periodo ${range.from} a ${range.to}` },
        { key: "anterior", label: "Periodo anterior" },
        { key: "variacion", label: "Variación %" },
      ],
      rows: kpis,
    },
    {
      name: "Actividad",
      columns: [
        { key: "bucket", label: "Periodo" },
        { key: "conversaciones", label: "Conversaciones" },
        { key: "clientes", label: "Clientes nuevos" },
        { key: "asignaciones", label: "Asignaciones" },
        { key: "citas", label: "Citas" },
        { key: "mensajes", label: "Mensajes" },
        { key: "mensajes_entrantes", label: "Mensajes del cliente" },
        { key: "mensajes_salientes", label: "Mensajes del bot y asesores" },
      ],
      rows: data.series || [],
    },
    {
      name: "Embudo",
      columns: [
        { key: "etapa", label: "Etapa" },
        { key: "total", label: "Conversaciones" },
        { key: "del_inicio", label: "% del inicio" },
        { key: "de_la_anterior", label: "% de la etapa anterior" },
      ],
      rows: stages,
    },
    {
      name: "Calidad de leads",
      columns: [
        { key: "label", label: "Calidad" },
        { key: "total", label: "Conversaciones" },
        { key: "porcentaje", label: "% del total" },
      ],
      rows: (data.quality || []).map((q) => ({
        ...q,
        porcentaje: share(q.total, qualityTotal),
      })),
    },
    {
      name: "Estatus",
      columns: [
        { key: "tipo", label: "Reporte" },
        { key: "label", label: "Estatus" },
        { key: "total", label: "Total" },
      ],
      rows: statuses,
    },
    { name: "Asesores", columns: ADVISOR_COLUMNS, rows: advisors },
    {
      name: "Respuestas del bot",
      columns: [
        { key: "question_label", label: "Pregunta" },
        { key: "answer_value", label: "Respuesta" },
        { key: "total", label: "Veces elegida" },
      ],
      rows: data.answers || [],
    },
  ];
};
