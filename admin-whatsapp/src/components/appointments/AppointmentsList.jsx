import { Edit, Delete } from "@mui/icons-material";
import { useTheme } from "../../context/ThemeContext";
export default function AppointmentsList() {
  const appointments = [
    {
      id: 1,
      time: "09:00 - 10:00",
      name: "Tony Hack",
      phone: "+1 234 567 890",
      note: "General Check-up",
      status: "Completed",
    },
    {
      id: 2,
      time: "10:30 - 11:30",
      name: "Jamie Urlic",
      phone: "+1 987 654 321",
      note: "Follow-up Consultation",
      status: "Cancelled",
    },
    {
      id: 3,
      time: "11:30 - 12:00",
      name: "Emily Watford",
      phone: "+1 555 666 777",
      note: "Headache",
      status: "Pending",
    },
  ];
  // 🎨 Estado → colores
  const statusClasses = {
    Completed: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
    Pending: "bg-blue-100 text-blue-700",
  };
  const { darkMode } = useTheme();
// Clases dinámicas
  const container = darkMode
    ? "rounded-xl border border-gray-700 bg-[#1e1e1e] shadow-sm"
    : "rounded-xl border border-gray-200 bg-white shadow-sm";

  const thead = darkMode
    ? "bg-[#2a2a2a] text-xs font-semibold text-gray-300 uppercase"
    : "bg-gray-50 text-xs font-semibold text-gray-500 uppercase";

  const tbody = darkMode
    ? "divide-y divide-gray-700 bg-[#1e1e1e]"
    : "divide-y divide-gray-200 bg-white";

  const rowHover = darkMode ? "hover:bg-[#2a2a2a]" : "hover:bg-gray-50";

  const textBase = darkMode ? "text-gray-300" : "text-gray-700";
  const textStrong = darkMode ? "text-gray-100" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-600";

  const actionBtn = darkMode
    ? "rounded-full p-1 text-gray-400 hover:bg-[#333333] hover:text-white"
    : "rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800";

  return (
    <div className={`overflow-x-auto ${container}`}>
      <table className="w-full border-collapse text-left text-sm">
        {/* Cabecera */}
        <thead className={thead}>
          <tr>
            <th className="px-6 py-3">Time</th>
            <th className="px-6 py-3">Patient</th>
            <th className="px-6 py-3">Phone</th>
            <th className="px-6 py-3">Note</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>

        {/* Filas */}
        <tbody className={tbody}>
          {appointments.map((appt) => (
            <tr key={appt.id} className={rowHover}>
              <td className={`px-6 py-4 ${textBase}`}>{appt.time}</td>
              <td className={`px-6 py-4 font-medium ${textStrong}`}>
                {appt.name}
              </td>
              <td className={`px-6 py-4 ${textMuted}`}>{appt.phone}</td>
              <td className={`px-6 py-4 ${textMuted}`}>{appt.note}</td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${statusClasses[appt.status]}`}
                >
                  <span className="h-2 w-2 rounded-full bg-current"></span>
                  {appt.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button className={actionBtn}>
                    <Delete fontSize="small" />
                  </button>
                  <button className={actionBtn}>
                    <Edit fontSize="small" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}