// Sidebar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaHome, FaCog, FaEnvelope, FaRegUserCircle  } from "react-icons/fa";

export default function Sidebar({ darkMode, toggleDarkMode, isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const sidebarWidth = isMobile ? (isOpen ? "140px" : "60px") : isOpen ? "220px" : "60px";

  const menuItems = [
    { id: "home", label: "Inicio", icon: <FaHome />, path: "/home" },
    { id: "messages", label: "Mensajes", icon: <FaEnvelope />, path: "/messages" },
    { id: "settings", label: "Configuración", icon: <FaCog />, path: "/settings" },
    { id: "users", label: "Usuarios", icon: <FaRegUserCircle />, path: "/usuarios" }

  ];

  const handleMenuClick = (item) => navigate(item.path);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",       // 🔹 asegura que siempre llene vertical
        width: sidebarWidth,
        padding: isOpen ? "20px 15px" : "20px 0",
        backgroundColor: darkMode ? "#1f1f1f" : "#ffffff",
        boxShadow: darkMode
          ? "2px 0 10px rgba(0,0,0,0.5)"
          : "2px 0 10px rgba(0,0,0,0.1)",
        transition: "width 0.3s, padding 0.3s",
        position: "relative",     // para dropdowns absolutos si agregas
      }}
    >
      {/* Botón abrir/cerrar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: darkMode ? "#fff" : "#333",
          fontSize: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <FaBars />
      </button>

      {/* Botones del menú */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          flex: 1,             // 🔹 ocupa todo el alto restante
          alignItems: isOpen ? "stretch" : "center",
        }}
      >
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: isOpen ? "12px 15px" : "12px 0",
                justifyContent: isOpen ? "flex-start" : "center",
                width: "100%",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: "500",
                backgroundColor: isActive
                  ? "#960b2b"
                  : isOpen
                  ? darkMode
                    ? "#2a2a2a"
                    : "#fff"
                  : "transparent",
                color: isActive ? "#fff" : darkMode ? "#fff" : "#333",
                transition: "all 0.2s",
              }}
            >
              {item.icon}
              {isOpen && item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
