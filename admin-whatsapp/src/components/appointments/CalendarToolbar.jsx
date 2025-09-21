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
  const surface =
    darkMode
      ? "bg-[#2a2a2a] text-gray-100 hover:bg-[#383838] shadow"
      : "bg-white text-gray-800 hover:bg-gray-100 shadow";

  const iconBtn = `p-2 rounded-lg ${surface}`;
  const chipBtn = `flex items-center gap-2 px-3 py-2 rounded-lg ${surface}`;

  return (
    <div
      className={`flex items-center justify-between px-1 py-5 border-t ${
        darkMode ? " border-gray-800" : " border-gray-200"
      }`}
    >
      {/* Left controls */}
      <div className="flex items-center gap-2">
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
            {currentDate.toLocaleDateString("en-US", {
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
      <div className={`text-sm ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
        <span className="font-bold text-3xl">{totalToday}</span> appointments today
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <button className={chipBtn} type="button">
          <Tune fontSize="small" />
          <span className="text-sm">Filter</span>
        </button>

        <button className={iconBtn} type="button" aria-label="Settings">
          <Settings fontSize="small" />
        </button>
      </div>
    </div>
  );
}
