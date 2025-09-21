import { useTheme } from "../context/ThemeContext"; 
import { List, CalendarMonth } from "@mui/icons-material";
import { useState } from "react";
import CalendarToolbar from "../components/appointments/CalendarToolbar";
import AppointmentsCalendar from "../components/appointments/AppointmentsCalendar";
export default function AppointmentsPage() {
  const { darkMode } = useTheme();
  const [view, setView] = useState("calendar");
  const [currentDate] = useState(new Date());

  return (
    <div className={darkMode ? "bg-[#1f1f1f] h-[calc(100vh-120px)] p-6" : "bg-white h-[calc(100vh-120px)] p-6"}>
      
      {/* Contenedor toggle */}
      <div
        className={`inline-flex w-80 items-center justify-between mb-4 rounded-xl p-1 ${
          darkMode ? "bg-[#2a2a2a]" : "bg-gray-100"
        }`}
      >
        {/* Botón List */}
        <button
          onClick={() => setView("list")}
          className={`flex items-center justify-center gap-2 w-1/2 px-4 py-2 rounded-xl text-sm font-medium transition-all
            ${view === "list"
              ? darkMode
                ? "bg-white text-black shadow"
                : "bg-white text-black shadow"
              : darkMode
                ? "text-gray-300 hover:bg-[#3a3a3a]"
                : "text-gray-600 hover:bg-gray-200"
            }`}
        >
          <List fontSize="small" />
          List
        </button>

        {/* Botón Calendar */}
        <button
          onClick={() => setView("calendar")}
          className={`flex items-center justify-center gap-2 w-1/2 px-4 py-2 rounded-xl text-sm font-medium transition-all
            ${view === "calendar"
              ? darkMode
                ? "bg-white text-black shadow"
                : "bg-white text-black shadow"
              : darkMode
                ? "text-gray-300 hover:bg-[#3a3a3a]"
                : "text-gray-600 hover:bg-gray-200"
            }`}
        >
          <CalendarMonth fontSize="small" />
          Calendar
        </button>
      </div>
      <CalendarToolbar currentDate={currentDate} />
      <AppointmentsCalendar/>
    </div>
  );
}
