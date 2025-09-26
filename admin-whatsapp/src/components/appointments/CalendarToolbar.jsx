import {
  CalendarMonth,
  ChevronLeft,
  ChevronRight,
  Tune,
  Settings,
} from "@mui/icons-material";
import { useTheme } from "../../context/ThemeContext";

export default function CalendarToolbar({
  currentDate,
  onPrev,
  onNext,
  totalToday = 3,
}) {
  const { darkMode } = useTheme();

  // Superficie (botones/chips) en claro/oscuro
  const surface = darkMode
    ? "bg-[#2a2a2a] text-gray-100 hover:bg-[#383838] shadow"
    : "bg-white text-gray-800 hover:bg-gray-100 shadow";

  const iconBtn = `p-2 rounded-lg transition-colors ${surface}`;
  const chipBtn = `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${surface}`;

  return (
    <div
      className={`flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-2 py-3 border-t ${
        darkMode
          ? "bg-[#181818] border-gray-800 text-gray-100"
          : "bg-gray-50 border-gray-200 text-gray-800"
      }`}
    >
      {/* Left controls */}
      <div className="flex items-center justify-center gap-2">
        <button
          className={iconBtn}
          onClick={onPrev}
          aria-label="Previous day"
          type="button"
        >
          <ChevronLeft fontSize="small" />
        </button>

        <button className={chipBtn} type="button" aria-label="Current date">
          <CalendarMonth fontSize="small" />
          <span className="text-sm font-medium">
            {currentDate.toLocaleDateString("es-MX", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </button>

        <button
          className={iconBtn}
          onClick={onNext}
          aria-label="Next day"
          type="button"
        >
          <ChevronRight fontSize="small" />
        </button>
      </div>

      {/* Center text */}
      <div
        className={`flex justify-center text-sm ${
          darkMode ? "text-gray-200" : "text-gray-700"
        }`}
      >
        <span
          className={`font-bold text-2xl sm:text-3xl ${
            darkMode ? "text-white" : "text-black"
          }`}
        >
          {totalToday}
        </span>
        <span className="ml-2 hidden sm:inline">citas hoy</span>
        <span className="ml-2 sm:hidden">hoy</span>
      </div>
    </div>
  );
}
