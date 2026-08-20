import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { chartTokens, tooltipStyle, unknownColor } from "../../utils/vizPalette";

const nf = new Intl.NumberFormat("es-MX");
const MAX_SEGMENTS = 6;

// Parte-de-un-todo de un vistazo: más de seis rebanadas se vuelven ilegibles,
// así que la cola se pliega en "Otros".
const foldTail = (data) => {
  if (data.length <= MAX_SEGMENTS) return data;
  const head = data.slice(0, MAX_SEGMENTS - 1);
  const tail = data.slice(MAX_SEGMENTS - 1);
  return [...head, { label: "Otros", total: tail.reduce((s, d) => s + d.total, 0) }];
};

export default function DonutPanel({
  title,
  subtitle,
  data = [],
  colors,
  darkMode,
  height = 200,
}) {
  const t = chartTokens(darkMode);
  const rows = foldTail(data.filter((d) => d.total > 0));
  const total = rows.reduce((sum, d) => sum + d.total, 0);

  // El color se busca por etiqueta, nunca por posición: las filas llegan
  // ordenadas por volumen y un cambio de ranking repintaría a las demás.
  const colorFor = (label) => colors?.[label] ?? unknownColor(darkMode);

  return (
    <div
      className={`rounded-2xl border shadow-sm flex flex-col overflow-hidden ${
        darkMode ? "bg-[#1a1a1a] border-gray-800" : "bg-white border-gray-100"
      }`}
    >
      <div
        className={`flex items-baseline justify-between gap-3 px-5 py-3.5 border-b ${
          darkMode ? "border-gray-800" : "border-gray-100"
        }`}
      >
        <h3 className={`text-sm font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
          {title}
        </h3>
        {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
      </div>

      {total === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">Sin datos en este periodo</p>
      ) : (
        <div className="p-3 flex flex-col sm:flex-row items-center gap-2">
          <div style={{ width: height, height }} className="flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rows}
                  dataKey="total"
                  nameKey="label"
                  innerRadius="58%"
                  outerRadius="88%"
                  paddingAngle={2}
                  stroke={t.surface}
                  strokeWidth={2}
                >
                  {rows.map((row) => (
                    <Cell key={row.label} fill={colorFor(row.label)} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle(darkMode)}
                  formatter={(value, name) => [
                    `${nf.format(value)} (${Math.round((value / total) * 100)}%)`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Leyenda con valores: la identidad y la cifra nunca dependen solo
              del color de la rebanada. */}
          <ul className="flex-1 min-w-0 w-full flex flex-col gap-1.5 px-2">
            {rows.map((row) => (
              <li key={row.label} className="flex items-center gap-2 text-sm">
                <span
                  className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: colorFor(row.label) }}
                />
                <span className={`truncate ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  {row.label}
                </span>
                <span className="ml-auto flex-shrink-0 tabular-nums text-xs text-gray-400">
                  {nf.format(row.total)} · {Math.round((row.total / total) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
