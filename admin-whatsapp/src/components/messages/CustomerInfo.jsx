// ...existing code...
export default function CustomerInfo({ chat, darkMode }) {
  if (!chat) return null;

  return (
    <div
      className={`w-full h-full border-l overflow-y-auto scrollbar-hidden p-4 space-y-4 ${
        darkMode
          ? "bg-[#1f1f1f] border-gray-700 text-white"
          : "bg-white border-gray-200 text-gray-900"
      }`}
      style={{ height: "100%" }}
    >
      {/* Info cliente */}
      <div>
        <h3 className="font-bold text-lg mb-2">👤 Cliente</h3>
        <p><strong>Teléfono:</strong> {chat.customer.telefono}</p>
        <p><strong>Email:</strong> {chat.customer.email}</p>
        <p><strong>Estado:</strong> {chat.conversation.status}</p>
      </div>

      {/* Ponderación */}
      <div>
        <h3 className="font-bold text-lg mb-2">📊 Ponderación</h3>
        <p>Score: <span className="text-[#960b2b] font-semibold">{chat.ponderacion.score}/100</span></p>
        <ul className="mt-2 space-y-1">
          {chat.ponderacion.respuestas.map((r, idx) => (
            <li key={idx} className={`p-2 rounded-md text-sm ${darkMode ? "bg-[#2a2a2a]" : "bg-gray-100"}`}>
              <p className="font-medium">{r.pregunta}</p>
              <p className="opacity-80">{r.valor}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Answers */}
      <div>
        <h3 className="font-bold text-lg mb-2">📝 Respuestas</h3>
        <ul className="space-y-1">
          {chat.answers.map((a) => (
            <li key={a.id} className={`p-2 rounded-md text-sm ${darkMode ? "bg-[#2a2a2a]" : "bg-gray-100"}`}>
              <p className="font-medium">{a.question_key}</p>
              <p className="opacity-80">{a.answer_value}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
// ...existing code...