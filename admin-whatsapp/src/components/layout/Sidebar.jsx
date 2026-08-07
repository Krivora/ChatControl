import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export default function Sidebar({ isOpen, setIsOpen }) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { darkMode } = useTheme();
  const { user } = useAuth(); // 👈 obtenemos el usuario

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const sidebarWidth = isMobile
    ? isOpen
      ? "w-40"
      : "w-16"
    : isOpen
    ? "w-60"
    : "w-16";

  // 🔒 menú dinámico según rol
  const baseItems = [
    { id: "home", label: "Inicio", icon: <HomeOutlinedIcon fontSize="small" />, path: "/" },
    { id: "messages", label: "Mensajes", icon: <ChatOutlinedIcon fontSize="small" />, path: "/messages" },
    { id: "assignment", label: "Asignación", icon: <AssignmentOutlinedIcon fontSize="small" />, path: "/assignments" },
    { id: "appointments", label: "Citas", icon: <CalendarMonthOutlinedIcon fontSize="small" />, path: "/appointments" },
    { id: "configuration", label: "Configuración", icon: <SettingsOutlinedIcon fontSize="small" />, path: "/contents" },
  ];

  const adminItems = [
    { id: "users", label: "Usuarios", icon: <PeopleOutlineIcon fontSize="small" />, path: "/users" },
  ];

 const menuItems =
  user?.role === "super_admin"
    ? [...baseItems, ...adminItems]
    : user?.role === "admin"
    ? [...baseItems, ...adminItems.filter((i) => i.id !== "users")] // admin no ve “usuarios”
    : user?.role === "usuario"
    ? baseItems.filter(
        (i) => i.id === "assignment" || i.id === "appointments"
      ) // usuario solo ve Asignación y Citas
    : baseItems;

  return (
    <aside
      className={`relative flex flex-col min-h-screen border-r transition-all duration-300
        ${sidebarWidth}
        ${darkMode
          ? "bg-[#161616] border-gray-800 text-gray-300"
          : "bg-white border-gray-200 text-gray-700"}`}
    >
      {/* Marca — también colapsa/expande al hacer clic */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? "Contraer menú" : "Expandir menú"}
        className={`flex items-center gap-3 h-[60px] px-3 flex-shrink-0 border-b w-full text-left select-none transition-colors ${
          darkMode
            ? "border-gray-800 hover:bg-[#1f1f1f]"
            : "border-gray-100 hover:bg-gray-50"
        }`}
      >
        <div className="w-9 h-9 rounded-xl bg-[#960b2b] flex items-center justify-center text-white font-bold flex-shrink-0">
          S
        </div>
        {isOpen && (
          <div className="min-w-0">
            <p className={`font-semibold text-sm leading-tight truncate ${
              darkMode ? "text-white" : "text-gray-900"
            }`}>
              Seminuevos
            </p>
            <p className="text-xs text-gray-400 leading-tight">Nissan</p>
          </div>
        )}
      </button>

      {/* Menú */}
      <nav className="flex flex-col gap-1 flex-1 p-2 mt-2">
        {isOpen && (
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Menú
          </p>
        )}

        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            title={!isOpen ? item.label : undefined}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
              ${isOpen ? "justify-start" : "justify-center"}
              ${
                isActive
                  ? darkMode
                    ? "bg-[#2a1119] text-white"
                    : "bg-[#fdf2f4] text-[#960b2b]"
                  : darkMode
                  ? "hover:bg-[#1f1f1f] text-gray-400 hover:text-white"
                  : "hover:bg-gray-50 text-gray-600 hover:text-gray-900"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-[#960b2b]" />
                )}
                <span className={isActive ? "text-[#960b2b]" : ""}>{item.icon}</span>
                {isOpen && <span className="truncate">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Colapsar */}
      <div className="p-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          title={isOpen ? "Contraer menú" : "Expandir menú"}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs transition-colors ${
            darkMode
              ? "text-gray-500 hover:bg-[#1f1f1f] hover:text-gray-300"
              : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
          }`}
        >
          {isOpen ? (
            <>
              <ChevronLeftIcon fontSize="small" />
              <span>Contraer</span>
            </>
          ) : (
            <ChevronRightIcon fontSize="small" />
          )}
        </button>
      </div>
    </aside>
  );
}
