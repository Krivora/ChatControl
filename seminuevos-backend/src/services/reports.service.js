// src/services/reports.service.js
import { ReportsRepo } from '../repositories/reports.repo.js';
import { DatasetsRepo, DATASET_TYPES, isDatasetType } from '../repositories/datasets.repo.js';
import { ApiError } from '../utils/ApiError.js';
import { calculatePoints, getRange, questionLabels } from '../utils/scoring.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const GRANULARITIES = ['day', 'week', 'month'];
const MAX_EXPORT_ROWS = 5000;

const toDay = (d) => d.toISOString().slice(0, 10);
const isDay = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v || ''));

// Rango por defecto: últimos 30 días incluyendo hoy.
const parseRange = (query = {}) => {
  const to = isDay(query.to) ? query.to : toDay(new Date());
  const from = isDay(query.from)
    ? query.from
    : toDay(new Date(Date.parse(`${to}T00:00:00Z`) - 29 * DAY_MS));

  if (from > to) throw new ApiError(400, 'El rango de fechas es inválido');
  return { from, to };
};

// Periodo inmediatamente anterior, del mismo largo, para comparar.
const previousRange = ({ from, to }) => {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  const span = end - start + DAY_MS;
  return { from: toDay(new Date(start - span)), to: toDay(new Date(start - DAY_MS)) };
};

// Si el rango es largo, agrupar por día produce una gráfica ilegible.
const autoGranularity = ({ from, to }) => {
  const days = (Date.parse(to) - Date.parse(from)) / DAY_MS + 1;
  if (days > 180) return 'month';
  if (days > 62) return 'week';
  return 'day';
};

// El overview son nueve consultas. Lanzarlas todas de golpe pide nueve
// conexiones nuevas al pool y el handshake TLS contra la base remota se pasa
// del connectionTimeout de 2s, así que se ejecutan en tandas pequeñas.
const BATCH_SIZE = 3;

const inBatches = async (tasks) => {
  const out = [];
  for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
    const batch = tasks.slice(i, i + BATCH_SIZE);
    out.push(...(await Promise.all(batch.map((fn) => fn()))));
  }
  return out;
};

// Respuestas del bot que vale la pena tener como columna propia al exportar.
const FLATTENED_ANSWERS = [
  'type_purchase',
  'type_car',
  'brand_model',
  'time_to_buy',
  'down_payment_max',
  'max_monthly_payment',
  'credit_bureau_status',
  'max_investment',
];

const COLUMN_LABELS = {
  customer_id: 'ID cliente',
  conversation_id: 'ID conversación',
  asignacion_id: 'ID asignación',
  cita_id: 'ID cita',
  mensaje_id: 'ID mensaje',
  respuesta_id: 'ID respuesta',
  cliente: 'Cliente',
  whatsapp: 'WhatsApp',
  registrado: 'Registrado',
  ultima_interaccion: 'Última interacción',
  conversacion_estatus: 'Estatus conversación',
  conversacion_inicio: 'Inicio conversación',
  conversacion_fin: 'Fin conversación',
  asignacion_estatus: 'Estatus asignación',
  asignado_el: 'Asignado el',
  asesor: 'Asesor',
  asesor_email: 'Email asesor',
  cita_fecha: 'Fecha de cita',
  cita_hora: 'Hora de cita',
  cita_estatus: 'Estatus de cita',
  puntos: 'Puntos',
  calidad: 'Calidad del lead',
  estatus: 'Estatus',
  estatus_seguimiento: 'Estatus de seguimiento',
  inicio: 'Inicio',
  fin: 'Fin',
  paso_actual: 'Paso del bot',
  recordatorio_enviado: 'Recordatorio enviado',
  mensajes: 'Mensajes',
  respuestas: 'Respuestas',
  fecha: 'Fecha',
  hora_inicio: 'Hora inicio',
  hora_fin: 'Hora fin',
  creada: 'Creada',
  emisor: 'Emisor',
  tipo: 'Tipo',
  contenido: 'Contenido',
  enviado: 'Enviado',
  pregunta: 'Pregunta',
  respuesta: 'Respuesta',
  respondido: 'Respondido',
  ...questionLabels,
};

const labelFor = (key) =>
  COLUMN_LABELS[key] ||
  key.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());

// Los estatus viven en inglés en la base. En un reporte que se exporta y se
// comparte tienen que salir legibles, así que se traducen al vuelo.
const VALUE_LABELS = {
  conversation_status: { active: 'Activa', finish: 'Finalizada' },
  assignment_status: { active: 'Activa', finish: 'Finalizada' },
  appointment_status: {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    rescheduled: 'Reagendada',
    in_progress: 'En curso',
    completed: 'Completada',
    cancelled: 'Cancelada',
    no_show: 'No asistió',
  },
  sender: { bot: 'Bot', customer: 'Cliente', user: 'Asesor' },
  question: questionLabels,
};

// Qué columna de cada dataset usa qué diccionario.
const DATASET_VALUE_MAPS = {
  leads: {
    conversacion_estatus: 'conversation_status',
    cita_estatus: 'appointment_status',
  },
  conversations: { estatus: 'conversation_status' },
  appointments: { estatus: 'appointment_status' },
  assignments: { estatus: 'assignment_status' },
  messages: { emisor: 'sender' },
  answers: { pregunta: 'question' },
};

// Un valor que no esté en el diccionario se deja tal cual: es preferible
// mostrar el dato crudo a esconderlo.
const translateValues = (type, rows) => {
  const mapping = DATASET_VALUE_MAPS[type];
  if (!mapping) return rows;

  const entries = Object.entries(mapping);
  return rows.map((row) => {
    const copy = { ...row };
    for (const [column, dictionary] of entries) {
      const value = copy[column];
      if (value != null) copy[column] = VALUE_LABELS[dictionary][value] ?? value;
    }
    return copy;
  });
};

// Los leads traen las respuestas del bot en un JSON; se convierten en puntaje
// y en columnas planas para que la tabla y el CSV sean utilizables.
const expandLead = (row) => {
  const { answers = [], ...rest } = row;
  const list = Array.isArray(answers) ? answers : [];
  const byKey = Object.fromEntries(
    list.map((a) => [a.question_key, a.answer_value])
  );
  const puntos = calculatePoints(list);

  return {
    ...rest,
    puntos,
    calidad: getRange(puntos).label,
    ...Object.fromEntries(FLATTENED_ANSWERS.map((k) => [k, byKey[k] ?? null])),
  };
};

export const ReportsService = {
  datasetTypes: DATASET_TYPES,

  // Un solo endpoint para todo el tablero: evita seis peticiones en paralelo
  // desde el navegador cada vez que se mueve el rango de fechas.
  /**
   * @param {{ from?: string, to?: string, granularity?: string }} input
   */
  async overview({ from, to, granularity: requested } = {}) {
    const range = parseRange({ from, to });
    const previous = previousRange(range);
    const granularity = GRANULARITIES.includes(requested)
      ? requested
      : autoGranularity(range);

    const [
      current,
      before,
      series,
      funnel,
      answers,
      conversationAnswers,
      advisors,
      status,
      heatmap,
    ] = await inBatches([
      () => ReportsRepo.summary(range),
      () => ReportsRepo.summary(previous),
      () => ReportsRepo.timeseries({ ...range, granularity }),
      () => ReportsRepo.funnel(range),
      () => ReportsRepo.answersBreakdown(range),
      () => ReportsRepo.conversationAnswers(range),
      () => ReportsRepo.advisors(range),
      () => ReportsRepo.statusBreakdown(range),
      () => ReportsRepo.activityHeatmap(range),
    ]);

    // Distribución de calidad de lead: se pondera aquí y no en SQL para no
    // duplicar la tabla de puntos dentro de la consulta.
    const quality = { Malo: 0, Regular: 0, Bien: 0, Excelente: 0 };
    let puntosTotales = 0;
    let conPuntos = 0;
    for (const row of conversationAnswers) {
      const list = Array.isArray(row.answers) ? row.answers : [];
      if (!list.length) continue;
      const puntos = calculatePoints(list);
      quality[getRange(puntos).label] += 1;
      puntosTotales += puntos;
      conPuntos += 1;
    }

    return {
      range: { ...range, granularity, previous },
      summary: current,
      previousSummary: before,
      series,
      funnel,
      answers: answers.map((a) => ({
        ...a,
        question_label: questionLabels[a.question_key] || a.question_key,
      })),
      quality: Object.entries(quality).map(([label, total]) => ({ label, total })),
      averageScore: conPuntos ? Math.round(puntosTotales / conPuntos) : 0,
      advisors,
      status,
      heatmap,
    };
  },

  // Dataset tabular para explorar y exportar.
  /**
   * @param {{ type?: string, from?: string, to?: string, q?: string,
   *           page?: number|string, pageSize?: number|string }} input
   */
  async dataset({ type: requestedType, from, to, q: rawQ, page: rawPage, pageSize: rawPageSize } = {}) {
    const type = String(requestedType || 'leads');
    if (!isDatasetType(type)) {
      throw new ApiError(400, `Tipo de reporte no válido: ${type}`);
    }

    const range = parseRange({ from, to });
    // La exportación usa su propio tope (MAX_EXPORT_ROWS), mucho mayor que el
    // de la paginación normal, así que no reutiliza parsePagination.
    const page = Math.max(1, Number(rawPage) || 1);
    const pageSize = Math.min(MAX_EXPORT_ROWS, Math.max(1, Number(rawPageSize) || 50));
    const q = String(rawQ || '').trim() || null;

    const { rows, total } = await DatasetsRepo.query(type, {
      ...range,
      q,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    const data = translateValues(type, type === 'leads' ? rows.map(expandLead) : rows);
    const keys = data.length ? Object.keys(data[0]) : [];

    return {
      type,
      range,
      columns: keys.map((key) => ({ key, label: labelFor(key) })),
      rows: data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        maxExportRows: MAX_EXPORT_ROWS,
      },
    };
  },
};
