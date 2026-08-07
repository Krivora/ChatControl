// Formato de fecha/hora compartido por la lista de mensajes y la tabla de
// asignaciones, para que ambas pantallas muestren exactamente lo mismo.
//
// ⚠️ El ajuste de -14h viene del comportamiento original de ConversationList:
// los timestamps se guardan sin zona horaria y JS los interpreta como locales.
// Si algún día se corrige el guardado, se cambia aquí y aplica en todos lados.
const HOUR_OFFSET = -14;

const parse = (value) => {
  if (!value) return null;
  const iso = String(value).replace(" ", "T").split(".")[0];
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  d.setHours(d.getHours() + HOUR_OFFSET);
  return d;
};

// "01:21 p.m."
export const formatTime = (value) => {
  const d = parse(value);
  if (!d) return "";
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// "6 ago"
export const formatDay = (value) => {
  const d = parse(value);
  if (!d) return "";
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
};

// "01:21 p.m. — 6 ago"
export const formatDateTime = (value, fallback = "Hora desconocida") => {
  const d = parse(value);
  if (!d) return fallback;
  return `${formatTime(value)} — ${formatDay(value)}`;
};

// Fecha local en formato YYYY-MM-DD, sin el ajuste de horas: para filtros
// de API y valores de <input type="date">.
export const toISODate = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

// Clave estable de día, para agrupar mensajes: "2026-08-06"
export const dayKey = (value) => {
  const d = parse(value);
  if (!d) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

// Separador de conversación: "Hoy", "Ayer" o "6 de agosto"
export const dayLabel = (value) => {
  const d = parse(value);
  if (!d) return "";

  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);

  const same = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (same(d, hoy)) return "Hoy";
  if (same(d, ayer)) return "Ayer";

  return d.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    ...(d.getFullYear() !== hoy.getFullYear() ? { year: "numeric" } : {}),
  });
};
