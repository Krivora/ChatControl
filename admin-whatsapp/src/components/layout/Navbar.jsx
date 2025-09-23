import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AccountCircle, Logout, ExpandMore } from "@mui/icons-material";

export default function Navbar() {
  const { darkMode } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={`flex justify-end items-center px-4 md:px-6 shadow h-[60px] ${
        darkMode ? "bg-[#1f1f1f]" : "bg-white"
      }`}
    >
      <ThemeToggle />

      {user && (
        <div
          ref={dropdownRef}
          className="relative ml-4"
        >
          {/* Botón usuario */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
          >
            {/* Avatar iniciales */}
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white font-semibold">
              {user.nombre?.charAt(0)}
              {user.apellido?.charAt(0)}
            </div>
            {/* Nombre */}
            <span className="hidden sm:block font-medium">
              {(user.nombre && user.apellido)
                ? `${user.nombre} ${user.apellido}`
                : user.nombre || user.email}
            </span>
            <ExpandMore fontSize="small" />
          </button>

          {/* Menú desplegable */}
          {menuOpen && (
            <div
              className={`absolute right-0 mt-2 rounded-xl shadow-lg z-50 min-w-[200px] border overflow-hidden ${
                darkMode
                  ? "bg-[#2a2a2a] text-white border-gray-700"
                  : "bg-white text-gray-800 border-gray-200"
              }`}
            >
              <div
                className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 dark:hover:bg-[#3a3a3a] cursor-pointer"
                onClick={() => {
                  navigate("/profile");
                  setMenuOpen(false);
                }}
              >
                <AccountCircle fontSize="small" />
                <span>Mi perfil</span>
              </div>
              <div
                className="flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-[#3a3a3a] cursor-pointer"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
              >
                <Logout fontSize="small" />
                <span>Cerrar sesión</span>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
