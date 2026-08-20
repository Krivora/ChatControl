import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import { chartTokens, seriesColor, tooltipStyle } from "../../utils/vizPalette";

const nf = new Intl.NumberFormat("es-MX");

// El bucket llega como 'YYYY-MM-DD' desde el backend; se parte a mano para no
// pasar por UTC y perder un día.
const formatBucket = (value, granularity) => {
  const [y, m, d] = String(value).split("-").map(Number);
  if (!y) return value;
  const date = new Date(y, (m || 1) - 1, d || 1);

  if (granularity === "month") {
    return new Intl.DateTimeFormat("es-MX", { month: "short", year: "2-digit" }).format(date);
  }
  return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short" }).format(date);
};

// Etiqueta directa solo en el último punto de cada serie: el eje y el tooltip
// cargan el resto de los valores.
const lastPointLabel = (lastIndex, color) => (props) => {
  const { x, y, value, index } = props;
  if (index !== lastIndex || !value) return null;
  return (
    <text x={x + 6} y={y + 4} fill={color} fontSize={11} fontWeight={600} textAnchor="start">
      {nf.format(value)}
    </text>
  );
};

export default function TrendChart({
  title,
  subtitle,
  data = [],
  series = [],
  granularity = "day",
  darkMode,
  height = 280,
}) {
  const t = chartTokens(darkMode);
  const lastIndex = data.length - 1;
  // Etiquetar el extremo de cada línea solo cuando hay pocas series: con
  // cuatro curvas que convergen, las cifras se enciman y se vuelven ruido.
  const showEndLabels = series.length <= 2;

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

      {/* La altura incluye la banda del eje X para que las etiquetas no
          provoquen un scroll interno en la tarjeta. */}
      <div className="p-3" style={{ height: height + 48 }}>
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">
            Sin datos en este periodo
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 16, right: showEndLabels ? 44 : 20, left: -16, bottom: 0 }}
            >
              <CartesianGrid vertical={false} stroke={t.grid} />
              <XAxis
                dataKey="bucket"
                stroke={t.axis}
                tickLine={false}
                axisLine={false}
                fontSize={11}
                minTickGap={24}
                tickFormatter={(v) => formatBucket(v, granularity)}
              />
              <YAxis
                stroke={t.axis}
                tickLine={false}
                axisLine={false}
                fontSize={11}
                allowDecimals={false}
                width={48}
              />
              <Tooltip
                cursor={{ stroke: t.brand, strokeWidth: 1 }}
                contentStyle={tooltipStyle(darkMode)}
                labelStyle={{ color: t.inkMuted }}
                labelFormatter={(v) => formatBucket(v, granularity)}
                formatter={(value, name) => [nf.format(value), name]}
              />
              <Legend
                verticalAlign="bottom"
                height={32}
                iconType="plainline"
                wrapperStyle={{ fontSize: 12, color: t.inkMuted }}
              />
              {series.map((s) => {
                const color = seriesColor(darkMode, s.colorIndex);
                return (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.label}
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: t.surface }}
                  >
                    {showEndLabels && (
                      <LabelList
                        dataKey={s.key}
                        content={lastPointLabel(lastIndex, color)}
                      />
                    )}
                  </Line>
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
