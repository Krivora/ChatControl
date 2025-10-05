import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

import {
  FaHome,
  FaCog,
  FaEnvelope,
  FaRegUserCircle,
  FaCalendar,
  FaTasks,
} from "react-icons/fa";

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
      ? "w-36"
      : "w-16"
    : isOpen
    ? "w-56"
    : "w-16";

  // 🔒 menú dinámico según rol
  const baseItems = [
    { id: "home", label: "Inicio", icon: <FaHome />, path: "/" },
    { id: "messages", label: "Mensajes", icon: <FaEnvelope />, path: "/messages" },
    { id: "assignment", label: "Asignación", icon: <FaTasks />, path: "/assignments" },
    { id: "appointments", label: "Citas", icon: <FaCalendar />, path: "/appointments" },
    { id: "configuration", label: "Configuración", icon: <FaCog />, path: "/configuration" },
  ];

  const adminItems = [
    { id: "users", label: "Usuarios", icon: <FaRegUserCircle />, path: "/users" },
  ];

  const menuItems =
    user?.role === "super_admin"
      ? [...baseItems, ...adminItems]
      : user?.role === "admin"
      ? [...baseItems, ...adminItems.filter((i) => i.id !== "users")] // admin no ve “usuarios”
      : baseItems;

  return (
    <aside
      className={`flex flex-col min-h-screen transition-all duration-300 shadow-md
        ${sidebarWidth}
        ${darkMode ? "bg-[#1f1f1f] text-white" : "bg-white text-gray-900"}`}
    >
      {/* Logo */}
      <div
        className={`flex flex-col items-center justify-center py-4 cursor-pointer select-none`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <>
            <span className="text-xl font-bold text-[#960b2b]">Seminuevos</span>
            <span
              className={`text-sm font-medium ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Nissan
            </span>
          </>
        ) : (
          <span className="text-xl font-bold text-[#960b2b]">S</span>
        )}
      </div>

      {/* Menú */}
      <nav className="flex flex-col gap-2 flex-1 mt-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors duration-200
              ${isOpen ? "justify-start" : "justify-center"}
              ${
                isActive
                  ? "bg-[#960b2b] text-white"
                  : darkMode
                  ? "hover:bg-[#2a2a2a] text-white"
                  : "hover:bg-gray-100 text-gray-800"
              }`
            }
          >
            {item.icon}
            {isOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
