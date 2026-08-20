// src/pages/Dashboard.jsx
import { useState } from "react";
import { Navigate } from "react-router-dom";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import GridOnIcon from "@mui/icons-material/GridOn";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../utils/alert";
import { useReports } from "../hooks/useReports";
import { usePrintMode } from "../hooks/usePrintMode";
import ReportFilters from "../components/reports/ReportFilters";
import KpiGrid from "../components/reports/KpiGrid";
import TrendChart from "../components/reports/TrendChart";
import FunnelPanel from "../components/reports/FunnelPanel";
import DonutPanel from "../components/reports/DonutPanel";
import AnswersPanel from "../components/reports/AnswersPanel";
import HeatmapPanel from "../components/reports/HeatmapPanel";
import AdvisorsTable from "../components/reports/AdvisorsTable";
import { QUALITY_COLORS, fixedColorMap } from "../utils/vizPalette";
import { downloadCsv, exportFilename } from "../utils/exportData";
import { downloadExcel } from "../utils/exportExcel";
import { buildSummaryWorkbook } from "../utils/reportWorkbook";
import {
  APPOINTMENT_LABELS,
  APPOINTMENT_ORDER,
  ASSIGNMENT_ORDER,
  CONVERSATION_LABELS,
  CONVERSATION_ORDER,
  translateLabels,
} from "../utils/reportLabels";

// El color de cada serie se toma por su índice fijo en este catálogo: quitar
// una serie del tablero no repinta a las demás.
const ACTIVITY_SERIES = [
  { key: "conversaciones", label: "Conversaciones", colorIndex: 0 },
  { key: "clientes", label: "Clientes nuevos", colorIndex: 1 },
  { key: "asignaciones", label: "Asignaciones", colorIndex: 2 },
  { key: "citas", label: "Citas", colorIndex: 3 },
];

// Los mensajes van en su propia gráfica: comparten eje de tiempo pero no de
// magnitud (miles contra decenas), y un segundo eje inventaría correlaciones.
const MESSAGE_SERIES = [
  { key: "mensajes_entrantes", label: "Del cliente", colorIndex: 4 },
  { key: "mensajes_salientes", label: "Del bot y asesores", colorIndex: 5 },
];

export default function Dashboard() {
  const { darkMode: themeDarkMode } = useTheme();
  const { user } = useAuth();
  const { showSnack } = useAlert();
  const [exporting, setExporting] = useState(false);
  const { printing, print } = usePrintMode();

  // El papel siempre es blanco: al imprimir todo el tablero se pinta en claro,
  // aunque el usuario tenga el tema oscuro. Cada panel recibe este valor, así
  // que también cambian los colores de las gráficas —que son distintos para
  // fondo claro y oscuro— y no solo los fondos.
  const darkMode = themeDarkMode && !printing;

  const {
    data,
    loading,
    refreshing,
    error,
    range,
    setRange,
    granularity,
    setGranularity,
    reload,
  } = useReports("30d");

  const granularityUsed = data?.range?.granularity || "day";
  const statusColors = {
    appointments: fixedColorMap(APPOINTMENT_ORDER, darkMode),
    assignments: fixedColorMap(ASSIGNMENT_ORDER, darkMode),
    conversations: fixedColorMap(CONVERSATION_ORDER, darkMode),
  };

  // Todo el tablero en un solo libro: una hoja por bloque (KPIs, actividad,
  // embudo, calidad, estatus, asesores y respuestas del bot).
  const exportWorkbook = async () => {
    if (!data) return;
    setExporting(true);
    try {
      await downloadExcel(
        exportFilename(`resumen-${range.from}_${range.to}`, "xlsx"),
        buildSummaryWorkbook(data, range)
      );
      showSnack("Resumen exportado a Excel", "success");
    } catch (err) {
      console.error(err);
      showSnack(err.message || "No se pudo generar el Excel", "error");
    } finally {
      setExporting(false);
    }
  };

  // La serie sola en CSV, para pegarla rápido en otra hoja o herramienta.
  const exportSeries = () => {
    if (!data?.series?.length) return;
    const activity = buildSummaryWorkbook(data, range).find((s) => s.name === "Actividad");
    downloadCsv(
      exportFilename(`actividad-${range.from}_${range.to}`, "csv"),
      activity.columns,
      activity.rows
    );
  };

  const secondaryButton = `px-3 py-2 rounded-lg text-sm border flex items-center gap-2 transition-colors disabled:opacity-50 ${
    darkMode
      ? "bg-[#2a2a2a] text-gray-200 border-gray-700"
      : "bg-gray-100 text-gray-700 border-gray-200"
  }`;

  // El resumen cruza la cartera de todos los asesores y el backend lo
  // restringe a administración; un asesor arranca en su bandeja.
  if (user && user.role === "usuario") {
    return <Navigate to="/assignments" replace />;
  }

  return (
    <div className={`print-page space-y-4 ${printing ? "printing-preview" : ""}`}>
      {/* Una sola fila de filtros para todo lo que está debajo */}
      <ReportFilters
        range={range}
        onRangeChange={setRange}
        granularity={granularity}
        onGranularityChange={setGranularity}
        onReload={reload}
        refreshing={refreshing}
        darkMode={darkMode}
      >
        <button
          onClick={exportWorkbook}
          className={secondaryButton}
          disabled={!data || exporting}
          title="Descargar todo el resumen en un libro de Excel"
        >
          <GridOnIcon fontSize="small" />
          {exporting ? "Generando..." : "Excel"}
        </button>
        <button
          onClick={exportSeries}
          className={secondaryButton}
          disabled={!data}
          title="Descargar solo la serie de actividad en CSV"
        >
          <DownloadIcon fontSize="small" />
          CSV
        </button>
        <button onClick={print} className={secondaryButton} disabled={printing}>
          <PrintIcon fontSize="small" />
          {printing ? "Preparando..." : "Imprimir / PDF"}
        </button>
      </ReportFilters>

      {/* Encabezado que solo sale en el papel: sin él la hoja impresa no dice
          de qué periodo son los números. */}
      <div className="hidden print:block print-block mb-4">
        <h1 className="text-xl font-semibold">Resumen general</h1>
        <p className="text-sm text-gray-600">
          Periodo del {range.from} al {range.to}
        </p>
      </div>

      {error && (
        <div
          className={`rounded-2xl border p-5 text-sm ${
            darkMode
              ? "bg-[#1a1a1a] border-gray-800 text-[#e66767]"
              : "bg-white border-gray-100 text-[#d03b3b]"
          }`}
        >
          {error}
        </div>
      )}

      {loading ? (
        // Solo en la primera carga: los refrescos posteriores atenúan la vista
        // en lugar de reemplazarla.
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-2xl border shadow-sm p-5 h-[132px] animate-pulse ${
                darkMode ? "bg-[#1a1a1a] border-gray-800" : "bg-white border-gray-100"
              }`}
            />
          ))}
        </div>
      ) : (
        data && (
          // Mientras recarga se mantiene la vista anterior atenuada: sin
          // esqueletos que hagan saltar el layout en cada cambio de rango.
          // En impresión la opacidad se anula, o el PDF sale desvaído.
          <div
            className={`space-y-4 transition-opacity print:opacity-100 ${
              refreshing ? "opacity-60" : "opacity-100"
            }`}
          >
            <div className="print-block">
              <KpiGrid
                summary={data.summary}
                previousSummary={data.previousSummary}
                darkMode={darkMode}
              />
            </div>

            <div className="print-block">
              <TrendChart
                title="Actividad comercial"
                subtitle={`${range.from} a ${range.to}`}
                data={data.series}
                series={ACTIVITY_SERIES}
                granularity={granularityUsed}
                darkMode={darkMode}
              />
            </div>

            <div className="report-pair grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="print-block">
                <TrendChart
                  title="Volumen de mensajes"
                  subtitle="Entrantes y salientes"
                  data={data.series}
                  series={MESSAGE_SERIES}
                  granularity={granularityUsed}
                  darkMode={darkMode}
                  height={220}
                />
              </div>
              <div className="print-block">
                <FunnelPanel funnel={data.funnel} darkMode={darkMode} />
              </div>
            </div>

            <div className="report-pair grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="print-block">
                <DonutPanel
                  title="Calidad de los leads"
                  subtitle={`Puntaje promedio: ${data.averageScore} pts`}
                  data={data.quality}
                  colors={QUALITY_COLORS}
                  darkMode={darkMode}
                />
              </div>
              <div className="print-block">
                <AnswersPanel answers={data.answers} darkMode={darkMode} />
              </div>
            </div>

            <div className="report-pair grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="print-block">
                <DonutPanel
                  title="Estatus de seguimiento"
                  subtitle="Asignaciones del periodo"
                  data={data.status?.assignments}
                  colors={statusColors.assignments}
                  darkMode={darkMode}
                />
              </div>
              <div className="print-block">
                <DonutPanel
                  title="Estatus de las citas"
                  data={translateLabels(data.status?.appointments, APPOINTMENT_LABELS)}
                  colors={statusColors.appointments}
                  darkMode={darkMode}
                />
              </div>
            </div>

            <div className="print-block">
              <AdvisorsTable advisors={data.advisors} darkMode={darkMode} />
            </div>

            <div className="print-block">
              <HeatmapPanel heatmap={data.heatmap} darkMode={darkMode} />
            </div>

            <div className="print-block">
              <DonutPanel
                title="Estado de las conversaciones"
                data={translateLabels(data.status?.conversations, CONVERSATION_LABELS)}
                colors={statusColors.conversations}
                darkMode={darkMode}
              />
            </div>
          </div>
        )
      )}
    </div>
  );
}
