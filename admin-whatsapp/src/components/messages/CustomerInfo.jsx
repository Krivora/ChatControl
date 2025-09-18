import React from "react";

const questionLabels = {
  down_payment_max: "Enganche máximo",
  max_monthly_payment: "Pago mensual máximo",
  credit_bureau_status: "Estatus en buró de crédito",
  time_to_buy: "Tiempo estimado de compra",
};

const statusMap = {
  finish: "Terminado",
  active: "En proceso",
};

// Mapas de respuestas con puntos
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

// Función para formatear número de teléfono: siempre XXX XXX XXXX
function formatPhone(phone) {
  if (!phone) return "No disponible";
  const digits = phone.replace(/\D/g, "");
  const local = digits.slice(-10);
  if (local.length !== 10) return phone;
  return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6, 10)}`;
}

export default function Ponderacion({ chat, darkMode }) {
  if (!chat) return null;

  const customer = chat.customer;
  const filteredAnswers = chat.answers?.filter((a) =>
    Object.keys(questionLabels).includes(a.question_key)
  ) || [];

  return (
    <div
      className={`w-full h-full border-l overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 ${
        darkMode
          ? "bg-[#1f1f1f] border-gray-700 text-white scrollbar-thumb-gray-600 scrollbar-track-[#2a2a2a]"
          : "bg-white border-gray-200 text-gray-900"
      }`}
    >
      {/* Información del cliente */}
      <div className="mb-6">
        <h3 className="font-bold text-xl mb-3">Información del Cliente</h3>

        {customer ? (
          <>
            <p>
              <strong>Cliente:</strong> {customer.full_name ?? "No disponible"}
            </p>
            <p>
              <strong>Teléfono:</strong> {formatPhone(customer.whatsapp_id)}
            </p>
          </>
        ) : (
          <p>No hay información disponible del cliente.</p>
        )}

        <p>
          <strong>Estado:</strong> {statusMap[chat.conversation?.status] ?? "No disponible"}
        </p>
      </div>

      {/* Respuestas */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Ponderación</h2>

        {/* Total de puntos */}
        {filteredAnswers.length > 0 && (
          <div
            className={`p-3 rounded-xl shadow mb-2 ${
              darkMode ? "bg-[#2a2a2a]" : "bg-gray-100"
            }`}
          >
            <p className="font-medium mb-1">Total</p>
            <p className="opacity-80">
              {filteredAnswers.reduce((sum, a) => {
                const options = ponderacionMap[a.question_key] || [];
                const matchedOption = options.find(
                  (opt) => opt.label.toLowerCase() === a.answer_value?.toLowerCase()
                );
                return sum + (matchedOption?.points || 0);
              }, 0)}{" "}
              / 170 puntos
            </p>
          </div>
        )}

        {filteredAnswers.map((a) => {
          const options = ponderacionMap[a.question_key] || [];
          const matchedOption = options.find(
            (opt) => opt.label.toLowerCase() === a.answer_value?.toLowerCase()
          );

          return (
            <div
              key={a.id}
              className={`p-3 rounded-xl shadow mb-2 ${
                darkMode ? "bg-[#2a2a2a]" : "bg-gray-100"
              }`}
            >
              <p className="font-medium">{questionLabels[a.question_key]}</p>
              <p className="opacity-80">{a.answer_value}</p>
              {matchedOption && (
                <p className="opacity-70 mt-1">Valor: {matchedOption.points} puntos</p>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
