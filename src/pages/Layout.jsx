// Layout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function Layout({ darkMode, toggleDarkMode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: darkMode ? "#121212" : "#f5f5f5",
      }}
    >
      <Sidebar
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "20px",
          color: darkMode ? "#fff" : "#000",
          transition: "margin-left 0.3s",
          marginLeft: isSidebarOpen ? "0px" : "40px", // solo se mueve poquito a la derecha
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
