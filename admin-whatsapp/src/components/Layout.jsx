import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../context/ThemeContext"; 

export default function Layout({ user, onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const { darkMode } = useTheme(); // 👈 se obtiene del contexto global

  // Cerrar menú si se hace click fuera
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
    <div
      className={`flex min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-[#121212] text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Sidebar ahora no necesita darkMode ni toggleDarkMode como props */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main content */}
      <main className="flex flex-col flex-1">
        {/* Header */}
        <header
          className={`flex justify-end items-center px-4 md:px-6 shadow h-[60px] ${
            darkMode ? "bg-[#1f1f1f]" : "bg-white"
          }`}
        >
          {/* Botón tema */}
          <ThemeToggle />

          {/* Usuario */}
          {user && (
            <div
              ref={dropdownRef}
              className="relative cursor-pointer ml-4"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span className="font-medium">{user.nombre || user.email} ⬇️</span>

              {menuOpen && (
                <div
                  className={`absolute right-0 mt-2 rounded-lg shadow-lg z-50 min-w-[160px] border ${
                    darkMode
                      ? "bg-[#2a2a2a] text-white border-gray-700"
                      : "bg-white text-gray-800 border-gray-200"
                  }`}
                >
                  <div
                    className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-[#444] cursor-pointer"
                    onClick={() => {
                      navigate("/profile");
                      setMenuOpen(false);
                    }}
                  >
                    👤 Mi perfil
                  </div>

                  <div
                    className="px-4 py-2 text-red-600 hover:bg-gray-200 dark:hover:bg-[#444] cursor-pointer"
                    onClick={onLogout}
                  >
                    🔓 Cerrar Sesión
                  </div>
                </div>
              )}
            </div>
          )}
        </header>

        {/* Contenido */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
