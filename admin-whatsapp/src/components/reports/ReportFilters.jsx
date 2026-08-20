import { useEffect, useState } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import { DATE_PRESETS, rangeFromPreset } from "../../hooks/useReports";

const GRANULARITIES = [
  { id: "auto", label: "Automático" },
  { id: "day", label: "Por día" },
  { id: "week", label: "Por semana" },
  { id: "month", label: "Por mes" },
];

// Una sola fila de filtros arriba de todo lo que afecta: mover el rango
// recalcula el tablero completo, no una gráfica suelta.
export default function ReportFilters({
  range,
  onRangeChange,
  granularity,
  onGranularityChange,
  onReload,
  refreshing,
  darkMode,
  // La agrupación solo aplica a las series de tiempo; en la extracción de
  // datos no significa nada, así que se puede ocultar.
  showGranularity = true,
  children,
}) {
  const [preset, setPreset] = useState("30d");

  // Si el rango cambia desde fuera (por ejemplo al escribir fechas a mano),
  // el preset deja de reflejarlo y se marca como personalizado.
  useEffect(() => {
    const match = DATE_PRESETS.find((p) => {
      const r = rangeFromPreset(p.id);
      return r.from === range.from && r.to === range.to;
    });
    setPreset(match?.id ?? "custom");
  }, [range.from, range.to]);

  const field = darkMode
    ? "bg-[#2a2a2a] text-gray-200 border-gray-700"
    : "bg-gray-100 text-gray-700 border-gray-200";

  const chip = (active) =>
    `px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
      active
        ? "bg-[#960b2b] text-white"
        : darkMode
        ? "bg-[#2a2a2a] text-gray-300 hover:bg-[#333]"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`;

  return (
    <div
      className={`rounded-2xl border shadow-sm p-3 flex flex-col gap-3 print:hidden ${
        darkMode ? "bg-[#1a1a1a] border-gray-800" : "bg-white border-gray-100"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        {DATE_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => onRangeChange(rangeFromPreset(p.id))}
            className={chip(preset === p.id)}
          >
            {p.label}
          </button>
        ))}
        {preset === "custom" && (
          <span className={chip(true)}>Rango personalizado</span>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-gray-400">Desde</span>
          <input
            type="date"
            value={range.from}
            max={range.to}
            onChange={(e) => onRangeChange({ ...range, from: e.target.value })}
            className={`px-3 py-2 rounded-lg text-sm border ${field}`}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-gray-400">Hasta</span>
          <input
            type="date"
            value={range.to}
            min={range.from}
            onChange={(e) => onRangeChange({ ...range, to: e.target.value })}
            className={`px-3 py-2 rounded-lg text-sm border ${field}`}
          />
        </label>

        {showGranularity && (
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-gray-400">Agrupar</span>
            <select
              value={granularity}
              onChange={(e) => onGranularityChange(e.target.value)}
              className={`px-3 py-2 rounded-lg text-sm border ${field}`}
            >
              {GRANULARITIES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
          </label>
        )}

        <button
          onClick={onReload}
          disabled={refreshing}
          title="Actualizar datos"
          className={`px-3 py-2 rounded-lg text-sm border flex items-center gap-2 transition-colors disabled:opacity-50 ${field}`}
        >
          <RefreshIcon fontSize="small" className={refreshing ? "animate-spin" : ""} />
          Actualizar
        </button>

        <div className="flex-1" />
        {children}
      </div>
    </div>
  );
}
