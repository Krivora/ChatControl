import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function WeeklyChart({ data, darkMode, weekRange }) {
  return (
    <div
      className={`flex flex-col justify-start items-center rounded-xl shadow-md 
      transition-all duration-300 p-5 font-roboto border-t-4 flex-1
      ${darkMode ? "bg-[#2a2a2a]" : "bg-white"} border-[#960b2b]`}
    >
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={darkMode ? "#444" : "#ccc"}
          />
          <XAxis dataKey="name" stroke={darkMode ? "#fff" : "#000"} />
          <YAxis stroke={darkMode ? "#fff" : "#000"} />
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? "#121212" : "#fff",
              color: darkMode ? "#fff" : "#000",
              border: `1px solid ${darkMode ? "#444" : "#ccc"}`,
            }}
          />
          <Legend wrapperStyle={{ color: darkMode ? "#fff" : "#000" }} />
          <Line type="monotone" dataKey="mensajes" stroke="#960b2b" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
      {weekRange && (
        <div className="text-xs text-center opacity-80 mb-2 w-full">
          Periodo: {weekRange.start} a {weekRange.end}
        </div>
      )}
    </div>
  );
}
