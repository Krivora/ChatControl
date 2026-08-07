import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function WeeklyChart({ data, darkMode, weekRange }) {
  const grid = darkMode ? "#2a2a2a" : "#f0f0f0";
  const axis = darkMode ? "#6b7280" : "#9ca3af";

  return (
    <div
      className={`rounded-2xl border shadow-sm flex flex-col overflow-hidden min-h-[300px] ${
        darkMode ? "bg-[#1a1a1a] border-gray-800" : "bg-white border-gray-100"
      }`}
    >
      <div
        className={`flex items-center justify-between px-5 py-3.5 border-b ${
          darkMode ? "border-gray-800" : "border-gray-100"
        }`}
      >
        <h3 className={`text-sm font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
          Actividad de la semana
        </h3>
        {weekRange?.start && (
          <span className="text-xs text-gray-400">
            {weekRange.start} — {weekRange.end}
          </span>
        )}
      </div>

      <div className="flex-1 p-3">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="weeklyFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#960b2b" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#960b2b" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke={grid} />
            <XAxis
              dataKey="name"
              stroke={axis}
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <YAxis
              stroke={axis}
              tickLine={false}
              axisLine={false}
              fontSize={12}
              allowDecimals={false}
              width={40}
            />
            <Tooltip
              cursor={{ stroke: "#960b2b", strokeWidth: 1, strokeDasharray: "4 4" }}
              contentStyle={{
                backgroundColor: darkMode ? "#1f1f1f" : "#fff",
                color: darkMode ? "#fff" : "#111",
                border: `1px solid ${darkMode ? "#333" : "#e5e7eb"}`,
                borderRadius: 12,
                fontSize: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              labelStyle={{ color: darkMode ? "#9ca3af" : "#6b7280" }}
            />
            <Area
              type="monotone"
              dataKey="mensajes"
              name="Clientes activos"
              stroke="#960b2b"
              strokeWidth={2.5}
              fill="url(#weeklyFill)"
              dot={{ r: 3, fill: "#960b2b", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
