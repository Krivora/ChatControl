// src/repositories/reports.repo.js
import { pool } from '../config/db.js';

// Cada tabla se acota por su columna de fecha "natural":
//   customers.created_at | conversations.started_at | messages.created_at
//   appointments.date (fecha agendada) | assignments.assigned_at
// El rango llega siempre como 'YYYY-MM-DD' y es inclusivo en ambos extremos.

// Whitelist: `granularity` se interpola dentro del interval de generate_series,
// así que nunca puede venir directo del query string.
const BUCKETS = { day: '1 day', week: '1 week', month: '1 month' };

export const ReportsRepo = {
  // KPIs de un rango. Se llama dos veces (periodo actual y anterior) para
  // poder mostrar la variación en las tarjetas.
  async summary({ from, to }) {
    const { rows } = await pool.query(
      `
      SELECT
        (SELECT count(*) FROM customers
          WHERE created_at::date BETWEEN $1 AND $2)                         AS customers_new,
        (SELECT count(*) FROM conversations
          WHERE started_at::date BETWEEN $1 AND $2)                         AS conversations_started,
        (SELECT count(*) FROM conversations
          WHERE started_at::date BETWEEN $1 AND $2 AND status = 'finish')   AS conversations_finished,
        (SELECT count(*) FROM conversations
          WHERE started_at::date BETWEEN $1 AND $2 AND status = 'active')   AS conversations_active,
        (SELECT count(DISTINCT conversation_id) FROM answers
          WHERE created_at::date BETWEEN $1 AND $2)                         AS conversations_profiled,
        (SELECT count(*) FROM messages
          WHERE created_at::date BETWEEN $1 AND $2)                         AS messages_total,
        (SELECT count(*) FROM messages
          WHERE created_at::date BETWEEN $1 AND $2 AND sender = 'customer') AS messages_in,
        (SELECT count(*) FROM messages
          WHERE created_at::date BETWEEN $1 AND $2 AND sender <> 'customer') AS messages_out,
        (SELECT count(*) FROM appointments
          WHERE date BETWEEN $1 AND $2)                                     AS appointments_total,
        (SELECT count(*) FROM appointments
          WHERE date BETWEEN $1 AND $2 AND status = 'completed')            AS appointments_completed,
        (SELECT count(*) FROM appointments
          WHERE date BETWEEN $1 AND $2 AND status = 'cancelled')            AS appointments_cancelled,
        (SELECT count(*) FROM appointments
          WHERE date BETWEEN $1 AND $2
            AND status NOT IN ('completed', 'cancelled'))                   AS appointments_pending,
        (SELECT count(*) FROM assignments
          WHERE assigned_at::date BETWEEN $1 AND $2)                        AS assignments_total,
        (SELECT count(*) FROM assignments
          WHERE assigned_at::date BETWEEN $1 AND $2
            AND status_assignment = 'En proceso')                           AS assignments_in_progress
      `,
      [from, to]
    );

    // pg devuelve count() como string (bigint); se normaliza a número.
    return Object.fromEntries(
      Object.entries(rows[0]).map(([k, v]) => [k, Number(v)])
    );
  },

  // Serie temporal de las cinco métricas principales, con los huecos en cero.
  async timeseries({ from, to, granularity = 'day' }) {
    const step = BUCKETS[granularity] || BUCKETS.day;

    const { rows } = await pool.query(
      `
      WITH buckets AS (
        SELECT generate_series(
          date_trunc($3, $1::timestamp),
          date_trunc($3, $2::timestamp),
          '${step}'::interval
        )::date AS bucket
      )
      SELECT
        to_char(b.bucket, 'YYYY-MM-DD') AS bucket,
        COALESCE(cu.n, 0)::int  AS clientes,
        COALESCE(cv.n, 0)::int  AS conversaciones,
        COALESCE(ms.n, 0)::int  AS mensajes,
        COALESCE(ms.entrantes, 0)::int  AS mensajes_entrantes,
        COALESCE(ms.salientes, 0)::int  AS mensajes_salientes,
        COALESCE(ap.n, 0)::int  AS citas,
        COALESCE(asg.n, 0)::int AS asignaciones
      FROM buckets b
      LEFT JOIN (
        SELECT date_trunc($3, created_at)::date AS bucket, count(*) AS n
        FROM customers WHERE created_at::date BETWEEN $1 AND $2 GROUP BY 1
      ) cu ON cu.bucket = b.bucket
      LEFT JOIN (
        SELECT date_trunc($3, started_at)::date AS bucket, count(*) AS n
        FROM conversations WHERE started_at::date BETWEEN $1 AND $2 GROUP BY 1
      ) cv ON cv.bucket = b.bucket
      LEFT JOIN (
        SELECT
          date_trunc($3, created_at)::date AS bucket,
          count(*) AS n,
          count(*) FILTER (WHERE sender = 'customer')  AS entrantes,
          count(*) FILTER (WHERE sender <> 'customer') AS salientes
        FROM messages WHERE created_at::date BETWEEN $1 AND $2 GROUP BY 1
      ) ms ON ms.bucket = b.bucket
      LEFT JOIN (
        SELECT date_trunc($3, date)::date AS bucket, count(*) AS n
        FROM appointments WHERE date BETWEEN $1 AND $2 GROUP BY 1
      ) ap ON ap.bucket = b.bucket
      LEFT JOIN (
        SELECT date_trunc($3, assigned_at)::date AS bucket, count(*) AS n
        FROM assignments WHERE assigned_at::date BETWEEN $1 AND $2 GROUP BY 1
      ) asg ON asg.bucket = b.bucket
      ORDER BY b.bucket
      `,
      [from, to, granularity]
    );
    return rows;
  },

  // Embudo: todas las etapas cuentan conversaciones iniciadas dentro del rango.
  async funnel({ from, to }) {
    const { rows } = await pool.query(
      `
      WITH base AS (
        SELECT id, customer_id FROM conversations
        WHERE started_at::date BETWEEN $1 AND $2
      )
      SELECT
        (SELECT count(*) FROM base) AS iniciadas,
        (SELECT count(DISTINCT a.conversation_id)
           FROM answers a JOIN base b ON b.id = a.conversation_id) AS perfiladas,
        (SELECT count(*) FROM (
           SELECT a.conversation_id
           FROM answers a JOIN base b ON b.id = a.conversation_id
           WHERE a.question_key IN ('down_payment_max', 'max_monthly_payment',
                                    'credit_bureau_status', 'time_to_buy')
           GROUP BY a.conversation_id
           HAVING count(DISTINCT a.question_key) = 4
         ) t) AS perfil_completo,
        (SELECT count(DISTINCT s.conversation_id)
           FROM assignments s JOIN base b ON b.id = s.conversation_id) AS asignadas,
        (SELECT count(DISTINCT b.id)
           FROM base b JOIN appointments p ON p.customer_id = b.customer_id) AS con_cita,
        (SELECT count(DISTINCT b.id)
           FROM base b JOIN appointments p ON p.customer_id = b.customer_id
          WHERE p.status = 'completed') AS cita_completada
      `,
      [from, to]
    );
    return Object.fromEntries(
      Object.entries(rows[0]).map(([k, v]) => [k, Number(v)])
    );
  },

  // Distribución de respuestas del bot: cuántas veces se eligió cada opción.
  async answersBreakdown({ from, to }) {
    const { rows } = await pool.query(
      `
      SELECT question_key, answer_value, count(*)::int AS total
      FROM answers
      WHERE created_at::date BETWEEN $1 AND $2
        AND answer_value IS NOT NULL
        AND btrim(answer_value) <> ''
      GROUP BY question_key, answer_value
      ORDER BY question_key, total DESC
      `,
      [from, to]
    );
    return rows;
  },

  // Respuestas agrupadas por conversación: el servicio las pondera para sacar
  // la distribución de calidad de leads.
  async conversationAnswers({ from, to }) {
    const { rows } = await pool.query(
      `
      SELECT
        c.id AS conversation_id,
        COALESCE(json_agg(
          json_build_object('question_key', a.question_key, 'answer_value', a.answer_value)
        ) FILTER (WHERE a.id IS NOT NULL), '[]') AS answers
      FROM conversations c
      LEFT JOIN answers a ON a.conversation_id = c.id
      WHERE c.started_at::date BETWEEN $1 AND $2
      GROUP BY c.id
      `,
      [from, to]
    );
    return rows;
  },

  // Desempeño por asesor. LEFT JOIN para que aparezcan también los que no
  // tuvieron actividad en el rango (con ceros).
  async advisors({ from, to }) {
    const { rows } = await pool.query(
      `
      SELECT
        u.id,
        u.nombre,
        u.apellido,
        u.email,
        r.name AS role_name,
        COALESCE(a.total, 0)::int             AS asignaciones,
        COALESCE(a.activas, 0)::int           AS activas,
        COALESCE(a.en_proceso, 0)::int        AS en_proceso,
        COALESCE(a.aprobados, 0)::int         AS aprobados,
        COALESCE(a.vendidos, 0)::int          AS vendidos,
        COALESCE(a.rechazados, 0)::int        AS rechazados,
        COALESCE(a.descartados, 0)::int       AS descartados,
        COALESCE(p.citas, 0)::int             AS citas,
        COALESCE(p.citas_completadas, 0)::int AS citas_completadas
      FROM users u
      LEFT JOIN roles r ON r.id = u.role_id
      LEFT JOIN (
        SELECT
          user_id,
          count(*)                                                   AS total,
          count(*) FILTER (WHERE status = 'active')                  AS activas,
          count(*) FILTER (WHERE status_assignment = 'En proceso')   AS en_proceso,
          count(*) FILTER (WHERE status_assignment ILIKE 'Aprobado%') AS aprobados,
          count(*) FILTER (WHERE status_assignment = 'Vendido')      AS vendidos,
          count(*) FILTER (WHERE status_assignment = 'Rechazado')    AS rechazados,
          count(*) FILTER (WHERE status_assignment = 'Descartado')   AS descartados
        FROM assignments
        WHERE assigned_at::date BETWEEN $1 AND $2
        GROUP BY user_id
      ) a ON a.user_id = u.id
      LEFT JOIN (
        SELECT
          advisor_id,
          count(*)                                     AS citas,
          count(*) FILTER (WHERE status = 'completed') AS citas_completadas
        FROM appointments
        WHERE date BETWEEN $1 AND $2
        GROUP BY advisor_id
      ) p ON p.advisor_id = u.id
      WHERE u.deleted_at IS NULL
      ORDER BY asignaciones DESC, u.nombre ASC
      `,
      [from, to]
    );
    return rows;
  },

  // Conteos por estatus para las gráficas de dona.
  async statusBreakdown({ from, to }) {
    const [assignments, appointments, conversations] = await Promise.all([
      pool.query(
        `SELECT COALESCE(status_assignment, 'Sin estatus') AS label, count(*)::int AS total
         FROM assignments WHERE assigned_at::date BETWEEN $1 AND $2
         GROUP BY 1 ORDER BY 2 DESC`,
        [from, to]
      ),
      pool.query(
        `SELECT COALESCE(status, 'sin estatus') AS label, count(*)::int AS total
         FROM appointments WHERE date BETWEEN $1 AND $2
         GROUP BY 1 ORDER BY 2 DESC`,
        [from, to]
      ),
      pool.query(
        `SELECT COALESCE(status, 'sin estatus') AS label, count(*)::int AS total
         FROM conversations WHERE started_at::date BETWEEN $1 AND $2
         GROUP BY 1 ORDER BY 2 DESC`,
        [from, to]
      ),
    ]);

    return {
      assignments: assignments.rows,
      appointments: appointments.rows,
      conversations: conversations.rows,
    };
  },

  // Mensajes entrantes por día de la semana y hora: dice a qué horas conviene
  // tener asesores disponibles.
  async activityHeatmap({ from, to }) {
    const { rows } = await pool.query(
      `
      SELECT
        EXTRACT(DOW  FROM created_at)::int AS weekday,
        EXTRACT(HOUR FROM created_at)::int AS hour,
        count(*)::int                      AS total
      FROM messages
      WHERE created_at::date BETWEEN $1 AND $2
        AND sender = 'customer'
      GROUP BY 1, 2
      ORDER BY 1, 2
      `,
      [from, to]
    );
    return rows;
  },
};
