import { useTheme } from "../context/ThemeContext"; 
import { List, CalendarMonth } from "@mui/icons-material";
import { useState } from "react";
import { AppointmentCalendar, AppointmentsList } from "../components/appointments";

export default function AppointmentsPage() {
  const { darkMode } = useTheme();
  const [view, setView] = useState("calendar");

  const views = [
    { id: "calendar", label: "Calendario", icon: <CalendarMonth fontSize="small" /> },
    { id: "list", label: "Lista", icon: <List fontSize="small" /> },
  ];

  return (
    <div className={darkMode ? "text-gray-100" : "text-gray-900"}>
      {/* Toggle de vista */}
      <div
        className={`inline-flex gap-1 p-1 rounded-xl mb-4 ${
          darkMode ? "bg-[#1a1a1a] border border-gray-800" : "bg-gray-200/60"
        }`}
      >
        {views.map((v) => {
          const isActive = view === v.id;
          return (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? darkMode
                    ? "bg-[#2a1119] text-white shadow-sm"
                    : "bg-white text-[#960b2b] shadow-sm"
                  : darkMode
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {v.icon}
              {v.label}
            </button>
          );
        })}
      </div>

      {/* Cambiar entre Calendar y List */}
      {view === "calendar" ? <AppointmentCalendar /> : <AppointmentsList />}
    </div>
  );
}
