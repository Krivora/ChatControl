import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaHome, FaCog, FaEnvelope, FaRegUserCircle,FaCalendar } from "react-icons/fa";

export default function Sidebar({ darkMode, isOpen, setIsOpen }) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const sidebarWidth = isMobile ? (isOpen ? "w-36" : "w-16") : isOpen ? "w-56" : "w-16";

  const menuItems = [
    { id: "home", label: "Inicio", icon: <FaHome />, path: "/" },
    { id: "messages", label: "Mensajes", icon: <FaEnvelope />, path: "/messages" },
    { id: "appointments", label: "Citas", icon: <FaCalendar />, path: "/appointments" },
    { id: "configuration", label: "configuration", icon: <FaCog />, path: "/configuration" },
    { id: "users", label: "Usuarios", icon: <FaRegUserCircle />, path: "/users" },
  ];

  return (
    <aside
      className={`flex flex-col min-h-screen transition-all duration-300 shadow-md
        ${sidebarWidth}
        ${darkMode ? "bg-[#1f1f1f] text-white" : "bg-white text-gray-900"}`}
    >
      {/* Botón abrir/cerrar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 text-xl flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#2a2a2a] ${
          darkMode ? "text-white" : "text-gray-800"
        }`}
      >
        <FaBars />
      </button>

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
