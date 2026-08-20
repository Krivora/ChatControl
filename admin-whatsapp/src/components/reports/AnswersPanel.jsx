import { useMemo, useState } from "react";
import { chartTokens } from "../../utils/vizPalette";

const nf = new Intl.NumberFormat("es-MX");

// Preguntas cerradas del bot: son las únicas cuya distribución dice algo.
// `name_question` o `brand_model` son texto libre y solo generarían ruido.
const CLOSED_QUESTIONS = [
  "time_to_buy",
  "credit_bureau_status",
  "down_payment_max",
  "max_monthly_payment",
  "type_purchase",
  "type_car",
  "max_investment",
  "post_profiling_action",
];

export default function AnswersPanel({ answers = [], darkMode }) {
  const t = chartTokens(darkMode);

  const questions = useMemo(() => {
    const seen = new Map();
    for (const a of answers) {
      if (!CLOSED_QUESTIONS.includes(a.question_key)) continue;
      if (!seen.has(a.question_key)) seen.set(a.question_key, a.question_label);
    }
    // Se respeta el orden del catálogo, no el que llegue de la consulta.
    return CLOSED_QUESTIONS.filter((k) => seen.has(k)).map((k) => ({
      key: k,
      label: seen.get(k),
    }));
  }, [answers]);

  const [selected, setSelected] = useState(null);
  const active = selected && questions.some((q) => q.key === selected)
    ? selected
    : questions[0]?.key;

  const rows = useMemo(() => {
    const list = answers
      .filter((a) => a.question_key === active)
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
    return list;
  }, [answers, active]);

  const max = rows.reduce((m, r) => Math.max(m, r.total), 0);
  const total = rows.reduce((s, r) => s + r.total, 0);

  return (
    <div
      className={`rounded-2xl border shadow-sm flex flex-col overflow-hidden ${
        darkMode ? "bg-[#1a1a1a] border-gray-800" : "bg-white border-gray-100"
      }`}
    >
      <div
        className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b ${
          darkMode ? "border-gray-800" : "border-gray-100"
        }`}
      >
        <h3 className={`text-sm font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
          Respuestas del bot
        </h3>
        <select
          value={active || ""}
          onChange={(e) => setSelected(e.target.value)}
          className={`px-2 py-1.5 rounded-lg text-xs border ${
            darkMode
              ? "bg-[#2a2a2a] text-gray-200 border-gray-700"
              : "bg-gray-100 text-gray-700 border-gray-200"
          }`}
        >
          {questions.map((q) => (
            <option key={q.key} value={q.key}>
              {q.label}
            </option>
          ))}
        </select>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            Sin respuestas en este periodo
          </p>
        ) : (
          rows.map((row) => (
            <div key={`${row.question_key}-${row.answer_value}`} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className={`truncate ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  {row.answer_value}
                </span>
                <span className="flex-shrink-0 tabular-nums text-xs text-gray-400">
                  {nf.format(row.total)} · {total ? Math.round((row.total / total) * 100) : 0}%
                </span>
              </div>
              <div
                className={`h-2 rounded-full overflow-hidden ${
                  darkMode ? "bg-[#2a2a2a]" : "bg-gray-100"
                }`}
              >
                {/* Una sola serie: un solo color para todas las barras. La
                    longitud ya codifica la magnitud. */}
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${max ? (row.total / max) * 100 : 0}%`,
                    backgroundColor: t.brand,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
