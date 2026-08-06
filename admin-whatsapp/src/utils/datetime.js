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
