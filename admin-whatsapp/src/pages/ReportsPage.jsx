import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { rangeFromPreset } from "../hooks/useReports";
import ReportFilters from "../components/reports/ReportFilters";
import DatasetExplorer from "../components/reports/DatasetExplorer";

// Extracción de datos. El resumen con KPIs y gráficas vive en Inicio.
export default function ReportsPage() {
  const { darkMode } = useTheme();
  const [range, setRange] = useState(() => rangeFromPreset("30d"));

  // El botón de actualizar no recarga la página: cambia este contador y el
  // explorador vuelve a pedir el dataset con los mismos filtros.
  const [reloadToken, setReloadToken] = useState(0);

  return (
    <div className="space-y-4">
      <ReportFilters
        range={range}
        onRangeChange={setRange}
        onReload={() => setReloadToken((n) => n + 1)}
        darkMode={darkMode}
        showGranularity={false}
      />

      <DatasetExplorer range={range} reloadToken={reloadToken} darkMode={darkMode} />
    </div>
  );
}
