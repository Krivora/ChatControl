import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useTheme } from "../../context/ThemeContext";

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { darkMode } = useTheme();

  return (
    <div
      // Áreas seguras: instalada como PWA, la app se dibuja de borde a borde
      // y sin esto la isla dinámica del iPhone tapa la barra superior.
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      className={`flex h-[100dvh] overflow-hidden transition-colors duration-300 ${
        darkMode ? "bg-[#121212] text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* 🖥️ Sidebar fijo en escritorio */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      </div>

      {/* 📱 En móvil es un cajón: como columna fija se comía el ancho */}
      {mobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* El cajón es `fixed`, o sea que no hereda las áreas seguras del
              contenedor: las vuelve a aplicar por su cuenta. */}
          <div
            style={{
              paddingTop: "env(safe-area-inset-top)",
              paddingBottom: "env(safe-area-inset-bottom)",
              paddingLeft: "env(safe-area-inset-left)",
            }}
            className={`w-64 h-full shadow-2xl ${
              darkMode ? "bg-[#161616]" : "bg-white"
            }`}
          >
            <Sidebar
              isOpen
              setIsOpen={() => setMobileNavOpen(false)}
              showCollapse={false}
              onNavigate={() => setMobileNavOpen(false)}
            />
          </div>
          <button
            aria-label="Cerrar menú"
            onClick={() => setMobileNavOpen(false)}
            className="flex-1 h-full bg-black/50"
          />
        </div>
      )}

      <main className="flex flex-col flex-1 min-w-0">
        <Navbar onMenu={() => setMobileNavOpen(true)} />
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
