import React from "react";
import {
  questionLabels,
  ponderacionMap,
  pointsFor,
  calculatePoints,
  getRange,
  initials,
  formatPhone,
  MAX_SCORE,
} from "../../utils/scoring";

const statusMap = {
  finish: "Terminado",
  active: "En proceso",
};

// Puntos máximos posibles de cada pregunta, para dibujar la barra relativa.
const maxPointsFor = (questionKey) =>
  Math.max(...(ponderacionMap[questionKey] || [{ points: 1 }]).map((o) => o.points));

export default function CustomerInfo({ chat, darkMode }) {
  if (!chat) return null;

  const customer = chat.customer;
  const answers =
    chat.answers?.filter((a) => Object.keys(questionLabels).includes(a.question_key)) || [];

  const total = calculatePoints(answers);
  const range = getRange(total);

  const card = darkMode
    ? "bg-[#1f1f1f] border-gray-800"
    : "bg-white border-gray-100";

  return (
    <div
      className={`w-full h-full border-l overflow-y-auto p-3 space-y-3 scrollbar-hidden ${
        darkMode
          ? "bg-[#161616] border-gray-800 text-white"
          : "bg-gray-50 border-gray-200 text-gray-900"
      }`}
    >
      {/* Tarjeta del cliente */}
      <div className={`rounded-2xl border shadow-sm p-4 ${card}`}>
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#960b2b] flex items-center justify-center text-white text-xl font-semibold">
            {initials(customer?.full_name)}
          </div>
          <h3 className="font-semibold text-base mt-3 break-words">
            {customer?.full_name || "Sin nombre"}
          </h3>
          <p className="text-sm text-gray-400 mt-0.5">
            {formatPhone(customer?.whatsapp_id)}
          </p>
          <span
            className={`mt-2 text-xs font-medium px-2.5 py-1 rounded-full ${
              darkMode ? "bg-[#2a2a2a] text-gray-300" : "bg-gray-100 text-gray-600"
            }`}
          >
            {statusMap[chat.conversation?.status] ?? "Sin estado"}
          </span>
        </div>
      </div>

      {/* Score total */}
      <div className={`rounded-2xl border shadow-sm p-4 ${card}`}>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xs uppercase tracking-wide text-gray-400">
            Ponderación
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${range.chip}`}>
            {range.label}
          </span>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-semibold">{total}</span>
          <span className="text-sm text-gray-400">/ {MAX_SCORE} pts</span>
        </div>

        <div
          className={`h-2 rounded-full overflow-hidden mt-3 ${
            darkMode ? "bg-gray-700" : "bg-gray-200"
          }`}
        >
          <div
            className={`h-full rounded-full transition-all ${range.bar}`}
            style={{ width: `${Math.min(100, (total / MAX_SCORE) * 100)}%` }}
          />
        </div>
      </div>

      {/* Respuestas */}
      {answers.length === 0 ? (
        <div className={`rounded-2xl border shadow-sm p-4 text-sm text-gray-400 ${card}`}>
          El cliente aún no responde la encuesta.
        </div>
      ) : (
        answers.map((a) => {
          const points = pointsFor(a);
          const max = maxPointsFor(a.question_key);

          return (
            <div key={a.id} className={`rounded-2xl border shadow-sm p-4 ${card}`}>
              <p className="text-xs uppercase tracking-wide text-gray-400">
                {questionLabels[a.question_key]}
              </p>
              <p className="font-medium mt-1 break-words">{a.answer_value}</p>

              <div className="flex items-center gap-2 mt-2">
                <div
                  className={`h-1.5 flex-1 rounded-full overflow-hidden ${
                    darkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
                >
                  <div
                    className="h-full rounded-full bg-[#960b2b]"
                    style={{ width: `${Math.min(100, (points / max) * 100)}%` }}
                  />
                </div>
                <span className="text-[11px] text-gray-400 flex-shrink-0">
                  {points} pts
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
