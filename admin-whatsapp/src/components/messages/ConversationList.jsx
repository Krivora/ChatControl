import React from "react";

function normalize(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/\s/g, "")
    .replace(/,/g, "")
    .replace(/\$/g, "")
    .replace(/–|-/g, "-");
}

const ponderacionMap = {
  down_payment_max: [
    { label: "$30,000 – $50,000", points: 15 },
    { label: "$50,000 – $70,000", points: 15 },
    { label: "$70,000 – $100,000", points: 20 },
    { label: "$100,000 – $200,000", points: 25 },
    { label: "$200,000 o más", points: 25 },
  ],
  max_monthly_payment: [
    { label: "$4,000 – $5,500", points: 25 },
    { label: "$5,500 – $7,000", points: 25 },
    { label: "$7,000 – $9,000", points: 25 },
    { label: "$9,000 o más", points: 25 },
  ],
  credit_bureau_status: [
    { label: "mal", points: 5 },
    { label: "regular", points: 15 },
    { label: "bien", points: 30 },
    { label: "excelente", points: 50 },
  ],
  time_to_buy: [
    { label: "Ya estoy listo", points: 70 },
    { label: "De 1 a 15 días", points: 15 },
    { label: "De 15 a 30 días", points: 10 },
    { label: "Más de 30 días", points: 5 },
  ],
};

function calculatePoints(answers = []) {
  return answers.reduce((sum, a) => {
    const options = ponderacionMap[a.question_key] || [];
    const matchedOption = options.find(
      (opt) => normalize(opt.label) === normalize(a.answer_value)
    );
    return sum + (matchedOption?.points || 0);
  }, 0);
}

const scoreRanges = [
  { min: 0, max: 50, color: "bg-red-500", label: "Malo" },
  { min: 51, max: 100, color: "bg-yellow-400", label: "Regular" },
  { min: 101, max: 140, color: "bg-green-400", label: "Bien" },
  { min: 141, max: 170, color: "bg-blue-500", label: "Excelente" },
];

function getRange(totalPoints) {
  return scoreRanges.find((r) => totalPoints >= r.min && totalPoints <= r.max) || {};
}

export default function ConversationList({ conversations = [], onSelect, selectedId, darkMode }) {
  return (
    <div
      className={`w-full border-r h-full overflow-y-auto scrollbar-hidden ${
        darkMode
          ? "bg-[#1f1f1f] border-gray-700 text-white"
          : "bg-white border-gray-200 text-gray-900"
      }`}
    >
      {conversations.length === 0 ? (
        <div className="p-4 text-sm text-gray-500">No hay conversaciones</div>
      ) : (
        conversations.map((conv) => {
          const convAnswers = conv.answers || [];
          const totalPoints = calculatePoints(convAnswers);
          const range = getRange(totalPoints);

          const lastMessage = conv.last_message || "Sin mensajes aún";

          // ---------------------
          // Hora con ajuste manual
          // ---------------------
          let lastMessageTime = "Hora desconocida";
          if (conv.last_message_time) {
            const dateISO = conv.last_message_time.replace(" ", "T").split(".")[0];
            const d = new Date(dateISO);

            if (!isNaN(d.getTime())) {
              // ⚙️ Ajuste horario (mantén tu valor actual)
              d.setHours(d.getHours() - 14);

              const hora = d.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });

              const dia = d.toLocaleDateString("es-MX", {
                day: "numeric",
                month: "short",
              });

              // 👇 Hora seguida del día (fácil de leer)
              lastMessageTime = `${hora} — ${dia}`;
            }
          }

          return (
            <div
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`p-4 cursor-pointer border-b ${
                selectedId === conv.id
                  ? "bg-[#960b2b] text-white"
                  : darkMode
                  ? "hover:bg-[#2a2a2a] border-gray-700"
                  : "hover:bg-gray-100 border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{conv.customer_name}</span>
                  <div
                    className={`w-4 h-4 rounded-full ${range.color}`}
                    title={range.label}
                  ></div>
                </div>
                <span className="text-xs opacity-70">{lastMessageTime}</span>
              </div>
              <p className="text-sm truncate opacity-80">{lastMessage}</p>
            </div>
          );
        })
      )}
    </div>
  );
}
