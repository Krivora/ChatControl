import { chartTokens } from "../../utils/vizPalette";
import { FUNNEL_STAGES } from "../../utils/reportLabels";

const nf = new Intl.NumberFormat("es-MX");

export default function FunnelPanel({ funnel, darkMode }) {
  const t = chartTokens(darkMode);
  const rows = FUNNEL_STAGES.map((s) => ({ ...s, value: funnel?.[s.key] ?? 0 }));
  const top = rows[0]?.value || 0;

  return (
    <div
      className={`rounded-2xl border shadow-sm flex flex-col overflow-hidden ${
        darkMode ? "bg-[#1a1a1a] border-gray-800" : "bg-white border-gray-100"
      }`}
    >
      <div
        className={`flex items-baseline justify-between gap-3 px-5 py-3.5 border-b ${
          darkMode ? "border-gray-800" : "border-gray-100"
        }`}
      >
        <h3 className={`text-sm font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
          Embudo de conversión
        </h3>
        <span className="text-xs text-gray-400">Sobre las conversaciones del periodo</span>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {top === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">Sin datos en este periodo</p>
        ) : (
          rows.map((row, i) => {
            const share = top ? (row.value / top) * 100 : 0;
            const prev = i > 0 ? rows[i - 1].value : null;
            // Caída respecto de la etapa anterior: es la lectura útil del
            // embudo, más que el porcentaje sobre el total.
            const step = prev ? Math.round((row.value / prev) * 100) : null;

            return (
              <div key={row.key} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
                    {row.label}
                  </span>
                  <span className="flex items-baseline gap-2 flex-shrink-0">
                    <span
                      className={`font-semibold tabular-nums ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {nf.format(row.value)}
                    </span>
                    <span className="text-xs text-gray-400 tabular-nums">
                      {Math.round(share)}%
                    </span>
                  </span>
                </div>

                <div
                  className={`h-2.5 rounded-full overflow-hidden ${
                    darkMode ? "bg-[#2a2a2a]" : "bg-gray-100"
                  }`}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.max(share, row.value > 0 ? 1.5 : 0)}%`, backgroundColor: t.brand }}
                  />
                </div>

                {step !== null && (
                  <p className="text-[11px] text-gray-400">
                    {step}% de la etapa anterior
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
