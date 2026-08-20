import { useMemo } from "react";
import { sequentialColor } from "../../utils/vizPalette";

const nf = new Intl.NumberFormat("es-MX");

// EXTRACT(DOW) de Postgres: 0 = domingo. Se reordena para empezar en lunes.
const WEEKDAYS = [
  { dow: 1, label: "Lun" },
  { dow: 2, label: "Mar" },
  { dow: 3, label: "Mié" },
  { dow: 4, label: "Jue" },
  { dow: 5, label: "Vie" },
  { dow: 6, label: "Sáb" },
  { dow: 0, label: "Dom" },
];

const HOURS = Array.from({ length: 24 }, (_, h) => h);

export default function HeatmapPanel({ heatmap = [], darkMode }) {
  const { byCell, max } = useMemo(() => {
    const map = new Map();
    let top = 0;
    for (const cell of heatmap) {
      map.set(`${cell.weekday}-${cell.hour}`, cell.total);
      if (cell.total > top) top = cell.total;
    }
    return { byCell: map, max: top };
  }, [heatmap]);

  const headerCell = darkMode ? "text-gray-500" : "text-gray-400";

  return (
    <div
      className={`rounded-2xl border shadow-sm flex flex-col overflow-hidden ${
        darkMode ? "bg-[#1a1a1a] border-gray-800" : "bg-white border-gray-100"
      }`}
    >
      <div
        className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b ${
          darkMode ? "border-gray-800" : "border-gray-100"
        }`}
      >
        <h3 className={`text-sm font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
          Cuándo escriben los clientes
        </h3>

        {/* Leyenda de la escala: sin ella el color no se puede leer. */}
        <div className="flex items-center gap-2 text-[11px] text-gray-400">
          <span>0</span>
          <div className="flex">
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((t) => (
              <span
                key={t}
                className="w-5 h-3"
                style={{ backgroundColor: sequentialColor(darkMode, t) }}
              />
            ))}
          </div>
          <span>{nf.format(max)}</span>
        </div>
      </div>

      {max === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">Sin mensajes en este periodo</p>
      ) : (
        // Rejilla ancha: hace scroll dentro de su propia caja en lugar de
        // empujar la página a lo ancho.
        <div className="p-3 overflow-x-auto">
          <div className="min-w-[620px]">
            <div className="flex gap-[2px] pl-9 mb-1">
              {HOURS.map((h) => (
                <span
                  key={h}
                  className={`flex-1 text-center text-[9px] tabular-nums ${headerCell}`}
                >
                  {h % 3 === 0 ? h : ""}
                </span>
              ))}
            </div>

            {WEEKDAYS.map((day) => (
              <div key={day.dow} className="flex items-center gap-[2px] mb-[2px]">
                <span className={`w-9 flex-shrink-0 text-[10px] ${headerCell}`}>
                  {day.label}
                </span>
                {HOURS.map((h) => {
                  const value = byCell.get(`${day.dow}-${h}`) || 0;
                  return (
                    <span
                      key={h}
                      title={`${day.label} ${String(h).padStart(2, "0")}:00 — ${nf.format(
                        value
                      )} mensajes`}
                      className="flex-1 h-5 rounded-[3px]"
                      style={{
                        backgroundColor: value
                          ? sequentialColor(darkMode, value / max)
                          : darkMode
                          ? "#232323"
                          : "#f4f4f2",
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="px-5 pb-3 text-[11px] text-gray-400">
        Mensajes entrantes por día y hora. Sirve para decidir en qué franjas
        conviene tener asesores disponibles.
      </p>
    </div>
  );
}
