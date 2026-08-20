// Etiquetas y catálogos compartidos por el tablero de reportes: los usan las
// gráficas, la traducción de estatus y el libro de Excel, así que viven en un
// solo lugar para que las tres vistas nunca digan cosas distintas.

// Etapas en el orden real del flujo: el bot asigna asesor apenas arranca la
// conversación, antes de terminar de perfilar.
export const FUNNEL_STAGES = [
  { key: "iniciadas", label: "Conversaciones iniciadas" },
  { key: "asignadas", label: "Asignadas a un asesor" },
  { key: "perfiladas", label: "Con al menos una respuesta" },
  { key: "perfil_completo", label: "Perfilamiento completo" },
  { key: "con_cita", label: "Con cita agendada" },
  { key: "cita_completada", label: "Cita completada" },
];

export const APPOINTMENT_LABELS = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  in_progress: "En curso",
  rescheduled: "Reagendada",
  completed: "Completada",
  cancelled: "Cancelada",
  no_show: "No asistió",
};

export const CONVERSATION_LABELS = { active: "Activa", finish: "Finalizada" };

// Catálogos fijos de estatus: dan a cada etiqueta su color por identidad. Las
// filas llegan ordenadas por volumen, así que asignar el color por posición
// repintaría los estatus cada vez que cambia el ranking.
export const APPOINTMENT_ORDER = [
  "Pendiente",
  "Confirmada",
  "Reagendada",
  "En curso",
  "Completada",
  "Cancelada",
];

export const ASSIGNMENT_ORDER = [
  "En proceso",
  "Aprobado",
  "Aprobado No Concretado",
  "Vendido",
  "Rechazado",
  "Descartado",
];

export const CONVERSATION_ORDER = ["Activa", "Finalizada"];

export const translateLabels = (rows = [], dictionary) =>
  rows.map((r) => ({ ...r, label: dictionary[r.label] || r.label }));
