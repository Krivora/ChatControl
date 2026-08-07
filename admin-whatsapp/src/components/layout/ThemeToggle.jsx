import { useTheme } from "../../context/ThemeContext";
import { Tooltip } from "@mui/material";
import { DarkModeOutlined, LightModeOutlined } from "@mui/icons-material";

export default function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <Tooltip title={darkMode ? "Cambiar a claro" : "Cambiar a oscuro"}>
      <button
        onClick={toggleDarkMode}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
          darkMode
            ? "text-gray-400 hover:bg-[#1f1f1f] hover:text-white"
            : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        }`}
      >
        {darkMode ? (
          <LightModeOutlined fontSize="small" />
        ) : (
          <DarkModeOutlined fontSize="small" />
        )}
      </button>
    </Tooltip>
  );
}
