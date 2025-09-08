import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaHome, FaCog, FaEnvelope } from "react-icons/fa";

export default function Sidebar({ darkMode, toggleDarkMode, isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation(); // ruta actual

  const menuItems = [
    { id: "home", label: "Inicio", icon: <FaHome />, path: "/" },
    { id: "messages", label: "Mensajes", icon: <FaEnvelope />, path: "/messages" },
    { id: "settings", label: "Configuración", icon: <FaCog />, path: "/settings" },
  ];

  const handleMenuClick = (item) => {
    navigate(item.path);
  };

  const buttonStyle = {
    padding: "12px 15px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: "500",
    transition: "all 0.2s",
    width: isOpen ? "100%" : "60px",
    justifyContent: isOpen ? "flex-start" : "center",
  };

  const buttonHover = (e) => {
    if (isOpen) e.currentTarget.style.backgroundColor = darkMode ? "#444" : "#d1bfff";
  };

  const buttonLeave = (e, active) => {
    if (!active) {
      e.currentTarget.style.backgroundColor = darkMode ? "#2a2a2a" : "#fff";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: isOpen ? "220px" : "60px",
        padding: isOpen ? "20px 15px" : "20px 0px",
        overflow: "hidden",
        backgroundColor: darkMode ? "#1f1f1f" : "#ffffff",
        boxShadow: darkMode ? "2px 0 10px rgba(0,0,0,0.5)" : "2px 0 10px rgba(0,0,0,0.1)",
        transition: "width 0.3s, padding 0.3s",
      }}
    >
      {/* Botón abrir/cerrar minimalista */}
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
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Botón Dark Mode */}
      {isOpen && (
        <button
          onClick={toggleDarkMode}
          style={{
            ...buttonStyle,
            backgroundColor: darkMode ? "#2a2a2a" : "#fff",
            color: darkMode ? "#fff" : "#333",
            marginBottom: "20px",
          }}
          onMouseEnter={buttonHover}
          onMouseLeave={(e) => buttonLeave(e, false)}
        >
          {darkMode ? "🌙 Dark" : "☀️ Light"}
        </button>
      )}

      {/* Botones del menú */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          flex: 1,
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
                ...buttonStyle,
                backgroundColor: isActive ? "#d1bfff" : isOpen ? (darkMode ? "#2a2a2a" : "#fff") : "transparent",
                color: darkMode ? "#fff" : "#333",
                justifyContent: isOpen ? "flex-start" : "center",
                width: isOpen ? "100%" : "50px",
                padding: isOpen ? "12px 15px" : "12px 0",
              }}
              onMouseEnter={buttonHover}
              onMouseLeave={(e) => buttonLeave(e, isActive)}
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
