// Layout.jsx
import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function Layout({ darkMode, toggleDarkMode, user, onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const containerStyle = {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: darkMode ? "#121212" : "#f5f5f5",
  };

  const mainStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    color: darkMode ? "#fff" : "#000",
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: isMobile ? "8px 12px" : "10px 20px",
    backgroundColor: darkMode ? "#1f1f1f" : "#fff",
    color: darkMode ? "#fff" : "#333",
    boxShadow: darkMode
      ? "0 2px 6px rgba(0,0,0,0.5)"
      : "0 2px 6px rgba(0,0,0,0.1)",
    borderTopRightRadius: "8px",
    borderBottomRightRadius: "8px",
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    gap: isMobile ? "6px" : "10px",
    height: isMobile ? "50px" : "60px",
    flexWrap: "wrap",
  };

  const rightControls = {
    display: "flex",
    alignItems: "center",
    gap: isMobile ? "6px" : "10px",
  };

  const userStyle = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    fontWeight: "500",
    position: "relative",
  };

  const dropdownStyle = {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: "6px",
    backgroundColor: darkMode ? "#2a2a2a" : "#fff",
    borderRadius: "8px",
    boxShadow: darkMode
      ? "0 4px 10px rgba(0,0,0,0.5)"
      : "0 4px 10px rgba(0,0,0,0.15)",
    overflow: "hidden",
    zIndex: 1000,
    minWidth: isMobile ? "140px" : "180px",
    fontSize: isMobile ? "14px" : "16px",
  };

  const dropdownItem = {
    padding: isMobile ? "8px 12px" : "10px 14px",
    cursor: "pointer",
    borderBottom: `1px solid ${darkMode ? "#444" : "#eee"}`,
    color: darkMode ? "#fff" : "#333",
    backgroundColor: darkMode ? "#2a2a2a" : "#fff",
    transition: "background 0.2s",
  };

  return (
    <div style={containerStyle}>
      <Sidebar
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isMobile={isMobile}
      />

      <main style={mainStyle}>
        {/* Header */}
        <div style={headerStyle}>
          {/* Botón tema */}
          <button
            onClick={toggleDarkMode}
            style={{
              border: "none",
              background: "transparent",
              fontSize: isMobile ? "16px" : "18px",
              cursor: "pointer",
              color: darkMode ? "#fff" : "#333",
            }}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          {/* Usuario con menú */}
          {user && (
            <div style={userStyle} onClick={() => setMenuOpen(!menuOpen)}>
              <span>{user.username} ⬇️</span>

              {menuOpen && (
                <div style={dropdownStyle}>
                  <div
                    style={dropdownItem}
                    onClick={() => {
                      navigate("/profile");
                      setMenuOpen(false);
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = darkMode
                        ? "#444"
                        : "#f5f5f5")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = darkMode
                        ? "#2a2a2a"
                        : "#fff")
                    }
                  >
                    👤 Mi perfil
                  </div>

                  <div
                    style={{
                      ...dropdownItem,
                      borderBottom: "none",
                      color: "#e30039",
                    }}
                    onClick={onLogout}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = darkMode
                        ? "#444"
                        : "#f5f5f5")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = darkMode
                        ? "#2a2a2a"
                        : "#fff")
                    }
                  >
                    🔓 Cerrar Sesión
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Contenido */}
        <div style={{ flex: 1, padding: isMobile ? "12px" : "20px" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
