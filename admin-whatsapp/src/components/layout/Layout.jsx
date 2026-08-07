import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useTheme } from "../../context/ThemeContext";

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { darkMode } = useTheme();

  return (
    <div
      className={`flex h-screen overflow-hidden transition-colors duration-300 ${
        darkMode ? "bg-[#121212] text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex flex-col flex-1 min-w-0">
        <Navbar />
        <div
          className={`flex-1 min-h-0 overflow-y-auto p-4 md:p-6 ${
            darkMode ? "bg-[#121212]" : "bg-gray-100"
          }`}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
