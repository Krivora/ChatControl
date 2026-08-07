import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AccountCircle, Logout, ExpandMore } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";

// Título de la página según la ruta activa.
const PAGE_TITLES = [
  { path: "/messages", title: "Mensajes", subtitle: "Conversaciones con clientes" },
  { path: "/assignments", title: "Asignación", subtitle: "Clientes por asesor" },
  { path: "/appointments", title: "Citas", subtitle: "Agenda de visitas" },
  { path: "/contents", title: "Configuración", subtitle: "Contenidos del bot" },
  { path: "/users", title: "Usuarios", subtitle: "Equipo y accesos" },
  { path: "/profile", title: "Mi perfil", subtitle: "" },
  { path: "/", title: "Inicio", subtitle: "Resumen general" },
];

const roleLabels = {
  super_admin: "Super admin",
  admin: "Administrador",
  usuario: "Asesor",
};

export default function Navbar({ onMenu }) {
  const { darkMode } = useTheme();
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const page =
    PAGE_TITLES.find((p) => p.path !== "/" && location.pathname.startsWith(p.path)) ||
    PAGE_TITLES.find((p) => p.path === "/");

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
      className={`flex justify-between items-center px-4 md:px-6 h-[60px] border-b flex-shrink-0 ${
        darkMode
          ? "bg-[#161616] border-gray-800"
          : "bg-white border-gray-200"
      }`}
    >
      {/* Menú móvil + título de la sección */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onMenu}
          aria-label="Abrir menú"
          className={`md:hidden w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg ${
            darkMode ? "text-gray-300 hover:bg-[#1f1f1f]" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <MenuIcon fontSize="small" />
        </button>

        <div className="min-w-0">
        <h1
          className={`font-semibold leading-tight truncate ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {page?.title}
        </h1>
        {page?.subtitle && (
          <p className="text-xs text-gray-400 leading-tight truncate hidden sm:block">
            {page.subtitle}
          </p>
        )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />

        {user && (
          <div ref={dropdownRef} className="relative ml-1">
            {/* Botón usuario */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl border transition-colors ${
                darkMode
                  ? "border-gray-800 hover:bg-[#1f1f1f]"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              {/* Avatar iniciales */}
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#960b2b] text-white text-sm font-semibold">
                {user.nombre?.charAt(0)}
                {user.apellido?.charAt(0)}
              </div>
              {/* Nombre */}
              <div className="hidden sm:block text-left leading-tight">
                <span
                  className={`block text-sm font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {user.nombre && user.apellido
                    ? `${user.nombre} ${user.apellido}`
                    : user.nombre || user.email}
                </span>
                <span className="block text-[11px] text-gray-400">
                  {roleLabels[user.role] || user.role}
                </span>
              </div>
              <ExpandMore fontSize="small" className="text-gray-400" />
            </button>

            {/* Menú desplegable */}
            {menuOpen && (
              <div
                className={`absolute right-0 mt-2 rounded-2xl shadow-lg z-50 min-w-[220px] border overflow-hidden ${
                  darkMode
                    ? "bg-[#1f1f1f] text-white border-gray-800"
                    : "bg-white text-gray-800 border-gray-200"
                }`}
              >
                <div
                  className={`px-4 py-3 border-b ${
                    darkMode ? "border-gray-800" : "border-gray-100"
                  }`}
                >
                  <p className="text-sm font-medium truncate">
                    {user.nombre} {user.apellido}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>

                {/* Opción: Mi perfil */}
                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    darkMode ? "hover:bg-[#2a2a2a]" : "hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    navigate("/profile");
                    setMenuOpen(false);
                  }}
                >
                  <AccountCircle fontSize="small" className="text-gray-400" />
                  <span>Mi perfil</span>
                </button>

                {/* Opción: Logout */}
                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 transition-colors ${
                    darkMode ? "hover:bg-[#2a2a2a]" : "hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    setMenuOpen(false);
                    logoutUser();
                  }}
                >
                  <Logout fontSize="small" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
