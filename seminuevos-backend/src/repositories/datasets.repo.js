// src/repositories/datasets.repo.js
// Consultas "planas" pensadas para explorar y exportar: cada dataset devuelve
// filas listas para volcarse a una tabla o a un CSV, más el total para paginar.
import { pool } from '../config/db.js';

// Un dataset = de dónde salen las filas, sobre qué columna se filtra la fecha
// y en qué columnas busca el texto libre. Definirlos como datos evita repetir
// cinco veces el mismo armado de WHERE/COUNT/LIMIT.
const DATASETS = {
  leads: {
    label: 'Leads / clientes',
    dateColumn: 'cu.created_at::date',
    searchColumns: ['cu.full_name', 'cu.whatsapp_id'],
    orderBy: 'cu.created_at DESC',
    groupBy: `cu.id, c.id, c.status, c.started_at, c.ended_at,
              asg.status_assignment, asg.assigned_at, u.nombre, u.apellido,
              ap.date, ap.time_start, ap.status`,
    select: `
      cu.id                  AS customer_id,
      cu.full_name           AS cliente,
      cu.whatsapp_id         AS whatsapp,
      cu.created_at          AS registrado,
      cu.last_interaction    AS ultima_interaccion,
      c.id                   AS conversation_id,
      c.status               AS conversacion_estatus,
      c.started_at           AS conversacion_inicio,
      c.ended_at             AS conversacion_fin,
      asg.status_assignment  AS asignacion_estatus,
      asg.assigned_at        AS asignado_el,
      NULLIF(btrim(concat_ws(' ', u.nombre, u.apellido)), '') AS asesor,
      ap.date                AS cita_fecha,
      ap.time_start          AS cita_hora,
      ap.status              AS cita_estatus,
      COALESCE(json_agg(
        json_build_object('question_key', ans.question_key, 'answer_value', ans.answer_value)
      ) FILTER (WHERE ans.id IS NOT NULL), '[]') AS answers`,
    from: `
      FROM customers cu
      LEFT JOIN LATERAL (
        SELECT v.id, v.status, v.started_at, v.ended_at
        FROM conversations v
        WHERE v.customer_id = cu.id
        ORDER BY v.started_at DESC NULLS LAST
        LIMIT 1
      ) c ON true
      LEFT JOIN LATERAL (
        SELECT a.user_id, a.status_assignment, a.assigned_at
        FROM assignments a
        WHERE a.conversation_id = c.id
        ORDER BY a.assigned_at DESC
        LIMIT 1
      ) asg ON true
      LEFT JOIN users u ON u.id = asg.user_id
      LEFT JOIN LATERAL (
        SELECT p.date, p.time_start, p.status
        FROM appointments p
        WHERE p.customer_id = cu.id
        ORDER BY p.date DESC, p.time_start DESC
        LIMIT 1
      ) ap ON true
      LEFT JOIN answers ans ON ans.conversation_id = c.id`,
    countFrom: 'FROM customers cu',
  },

  conversations: {
    label: 'Conversaciones',
    dateColumn: 'c.started_at::date',
    searchColumns: ['cu.full_name', 'cu.whatsapp_id'],
    orderBy: 'c.started_at DESC NULLS LAST',
    groupBy: 'c.id, cu.id',
    select: `
      c.id            AS conversation_id,
      cu.full_name    AS cliente,
      cu.whatsapp_id  AS whatsapp,
      c.status        AS estatus,
      c.started_at    AS inicio,
      c.ended_at      AS fin,
      c.current_step  AS paso_actual,
      c.reminder_sent AS recordatorio_enviado,
      count(DISTINCT m.id)::int AS mensajes,
      count(DISTINCT a.id)::int AS respuestas`,
    from: `
      FROM conversations c
      LEFT JOIN customers cu ON cu.id = c.customer_id
      LEFT JOIN messages m ON m.conversation_id = c.id
      LEFT JOIN answers a ON a.conversation_id = c.id`,
    countFrom: `
      FROM conversations c
      LEFT JOIN customers cu ON cu.id = c.customer_id`,
  },

  appointments: {
    label: 'Citas',
    dateColumn: 'p.date',
    searchColumns: ['cu.full_name', 'cu.whatsapp_id'],
    orderBy: 'p.date DESC, p.time_start DESC',
    select: `
      p.id           AS cita_id,
      cu.full_name   AS cliente,
      cu.whatsapp_id AS whatsapp,
      p.date         AS fecha,
      p.time_start   AS hora_inicio,
      p.time_end     AS hora_fin,
      p.status       AS estatus,
      p.created_at   AS creada,
      NULLIF(btrim(concat_ws(' ', u.nombre, u.apellido)), '') AS asesor,
      u.email        AS asesor_email`,
    from: `
      FROM appointments p
      LEFT JOIN customers cu ON cu.id = p.customer_id
      LEFT JOIN users u ON u.id = p.advisor_id`,
  },

  assignments: {
    label: 'Asignaciones',
    dateColumn: 'a.assigned_at::date',
    searchColumns: ['cu.full_name', 'cu.whatsapp_id', 'u.nombre', 'u.apellido'],
    orderBy: 'a.assigned_at DESC',
    select: `
      a.id                  AS asignacion_id,
      a.conversation_id     AS conversation_id,
      cu.full_name          AS cliente,
      cu.whatsapp_id        AS whatsapp,
      NULLIF(btrim(concat_ws(' ', u.nombre, u.apellido)), '') AS asesor,
      u.email               AS asesor_email,
      a.status              AS estatus,
      a.status_assignment   AS estatus_seguimiento,
      a.assigned_at         AS asignado_el`,
    from: `
      FROM assignments a
      LEFT JOIN conversations c ON c.id = a.conversation_id
      LEFT JOIN customers cu ON cu.id = c.customer_id
      LEFT JOIN users u ON u.id = a.user_id`,
  },

  messages: {
    label: 'Mensajes',
    dateColumn: 'm.created_at::date',
    searchColumns: ['m.content', 'cu.full_name', 'cu.whatsapp_id'],
    orderBy: 'm.created_at DESC',
    select: `
      m.id              AS mensaje_id,
      m.conversation_id AS conversation_id,
      cu.full_name      AS cliente,
      cu.whatsapp_id    AS whatsapp,
      m.sender          AS emisor,
      m.content_type    AS tipo,
      m.content         AS contenido,
      m.created_at      AS enviado`,
    from: `
      FROM messages m
      LEFT JOIN conversations c ON c.id = m.conversation_id
      LEFT JOIN customers cu ON cu.id = c.customer_id`,
  },

  answers: {
    label: 'Respuestas del bot',
    dateColumn: 'a.created_at::date',
    searchColumns: ['a.answer_value', 'a.question_key', 'cu.full_name'],
    orderBy: 'a.created_at DESC',
    select: `
      a.id              AS respuesta_id,
      a.conversation_id AS conversation_id,
      cu.full_name      AS cliente,
      cu.whatsapp_id    AS whatsapp,
      a.question_key    AS pregunta,
      a.answer_value    AS respuesta,
      a.created_at      AS respondido`,
    from: `
      FROM answers a
      LEFT JOIN conversations c ON c.id = a.conversation_id
      LEFT JOIN customers cu ON cu.id = c.customer_id`,
  },
};

export const DATASET_TYPES = Object.entries(DATASETS).map(([id, d]) => ({
  id,
  label: d.label,
}));

export const isDatasetType = (type) => Object.hasOwn(DATASETS, type);

// Arma el WHERE compartido por la consulta de filas y la de total, para que
// ambas cuenten sobre exactamente el mismo universo.
const buildWhere = (def, { from, to, q }) => {
  const params = [];
  const where = [];

  if (from && to) {
    params.push(from, to);
    where.push(`${def.dateColumn} BETWEEN $${params.length - 1} AND $${params.length}`);
  }

  if (q) {
    params.push(`%${q}%`);
    const idx = params.length;
    where.push(`(${def.searchColumns.map((c) => `${c} ILIKE $${idx}`).join(' OR ')})`);
  }

  return { params, sql: where.length ? `WHERE ${where.join(' AND ')}` : '' };
};

export const DatasetsRepo = {
  async query(type, { from, to, q, limit = 50, offset = 0 }) {
    const def = DATASETS[type];
    if (!def) throw new Error(`Dataset desconocido: ${type}`);

    const { params, sql: where } = buildWhere(def, { from, to, q });

    const rowsParams = [...params, limit, offset];
    const { rows } = await pool.query(
      `SELECT ${def.select}
       ${def.from}
       ${where}
       ${def.groupBy ? `GROUP BY ${def.groupBy}` : ''}
       ORDER BY ${def.orderBy}
       LIMIT $${rowsParams.length - 1} OFFSET $${rowsParams.length}`,
      rowsParams
    );

    // Los datasets con GROUP BY declaran un `countFrom` sin los joins de
    // detalle: así el total sale de un count(*) directo y no de contar grupos.
    const { rows: countRows } = await pool.query(
      `SELECT count(*)::int AS total ${def.countFrom || def.from} ${where}`,
      params
    );

    return { rows, total: countRows[0]?.total ?? 0 };
  },
};
