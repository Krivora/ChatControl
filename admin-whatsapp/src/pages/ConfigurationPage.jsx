export default function ConfigurationPage({ darkMode }) {
  return (
    <div className={darkMode ? "bg-[#1f1f1f] text-white min-h-screen" : "bg-white text-gray-900 min-h-screen"}>
      <h1 className="text-2xl font-bold p-4">Configuración</h1>
      {/* Aquí va el resto de tu contenido */}
    </div>
  );
}
