// Paleta de las gráficas de reportes.
//
// Los pasos se eligieron con el validador de accesibilidad (separación bajo
// daltonismo y contraste contra la superficie de cada tema), no a ojo:
//   claro  sobre #ffffff → peor par adyacente ΔE 9.1 (protan) / 22.9 (normal)
//   oscuro sobre #1a1a1a → peor par adyacente ΔE 8.4 (protan) / 19.8 (normal)
// El orden de los slots es parte de esa garantía: se asignan siempre en orden
// y por identidad de la serie, nunca por su posición en el ranking.

const SERIES_LIGHT = ["#960b2b", "#2a78d6", "#eda100", "#1baf7a", "#4a3aa7", "#eb6834"];
const SERIES_DARK  = ["#d84a6b", "#3987e5", "#c98500", "#199e70", "#9085e9", "#d95926"];

// Reservados para estado: nunca se usan como "serie 4".
const STATUS_COLORS = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
  neutral: "#2a78d6",
};

// Calidad del lead: mismo lenguaje de color que los chips de scoring.js.
export const QUALITY_COLORS = {
  Malo: STATUS_COLORS.critical,
  Regular: STATUS_COLORS.warning,
  Bien: STATUS_COLORS.good,
  Excelente: STATUS_COLORS.neutral,
};

export const chartTokens = (darkMode) => ({
  surface: darkMode ? "#1a1a1a" : "#ffffff",
  grid: darkMode ? "#2c2c2a" : "#eeeeea",
  axis: darkMode ? "#898781" : "#898781",
  ink: darkMode ? "#ffffff" : "#0b0b0b",
  inkMuted: darkMode ? "#c3c2b7" : "#52514e",
  brand: darkMode ? "#d84a6b" : "#960b2b",
  series: darkMode ? SERIES_DARK : SERIES_LIGHT,
});

// Color por identidad de serie: el índice viene del catálogo fijo de la
// gráfica, así que filtrar series no repinta a las que quedan.
export const seriesColor = (darkMode, index) => {
  const list = darkMode ? SERIES_DARK : SERIES_LIGHT;
  return list[index % list.length];
};

// Asigna un slot fijo a cada etiqueta a partir de un catálogo ordenado, no de
// la posición que le toque en los datos: si un estatus desaparece o cambia de
// lugar en el ranking, los demás conservan su color.
export const fixedColorMap = (labels, darkMode) =>
  Object.fromEntries(labels.map((label, i) => [label, seriesColor(darkMode, i)]));

// Etiqueta fuera del catálogo: gris neutro, nunca un color de serie prestado.
export const unknownColor = (darkMode) => (darkMode ? "#6b7280" : "#9ca3af");

// Rampa secuencial de un solo tono para magnitudes continuas (heatmap).
// `t` va de 0 (cerca de la superficie) a 1 (máximo).
export const sequentialColor = (darkMode, t) => {
  const value = Math.max(0, Math.min(1, t));
  const [r, g, b] = darkMode ? [232, 127, 156] : [150, 11, 43];
  // El extremo claro puede fundirse con la superficie: es lo esperado en una
  // escala secuencial, donde "casi cero" debe desaparecer.
  return `rgba(${r}, ${g}, ${b}, ${(0.08 + value * 0.92).toFixed(3)})`;
};

export const tooltipStyle = (darkMode) => ({
  backgroundColor: darkMode ? "#1f1f1f" : "#ffffff",
  color: darkMode ? "#fff" : "#111",
  border: `1px solid ${darkMode ? "#333" : "#e5e7eb"}`,
  borderRadius: 12,
  fontSize: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
});
