import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

export default function Layout({ user, onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { darkMode } = useTheme();
  const { user, logout } = useAuth();

  return (
    <div
      className={`flex min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-[#121212] text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex flex-col flex-1">
        <Navbar user={user} onLogout={logout} />
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
