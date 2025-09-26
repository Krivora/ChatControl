import { useState } from "react";

// Mapa de ponderación
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

function normalize(str) {
  if (!str) return "";
  return str.toLowerCase().replace(/\s/g, "").replace(/,/g, "").replace(/\$/g, "").replace(/–|-/g, "-");
}

function calculatePoints(answers = []) {
  return answers.reduce((sum, a) => {
    const options = ponderacionMap[a.question_key] || [];
    const matchedOption = options.find((opt) => normalize(opt.label) === normalize(a.answer_value));
    return sum + (matchedOption?.points || 0);
  }, 0);
}

// Rangos de puntaje con color
const scoreRanges = [
  { min: 0, max: 50, color: "bg-red-500", label: "Malo" },
  { min: 51, max: 100, color: "bg-yellow-400", label: "Regular" },
  { min: 101, max: 140, color: "bg-green-400", label: "Bien" },
  { min: 141, max: 170, color: "bg-blue-500", label: "Excelente" },
];

function getRange(totalPoints) {
  return scoreRanges.find((r) => totalPoints >= r.min && totalPoints <= r.max) || {};
}

export default function AssignmentTable({ assignments, onUpdatePonderacion, darkMode }) {
  const [editing, setEditing] = useState(null);
  const [newPonderacion, setNewPonderacion] = useState(0);

  return (
    <div className={`rounded-lg overflow-hidden shadow transition-colors duration-300 ${darkMode ? "bg-[#2a2a2a]" : "bg-white"}`}>
      <table className="w-full border-collapse">
        <thead className={darkMode ? "bg-[#333] text-white" : "bg-gray-100"}>
          <tr className="text-left">
            <th className="p-3">Cliente</th>
            <th className="p-3">Ponderación</th>
            <th className="p-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((a) => {
            const totalPoints = calculatePoints(a.answers || []);
            const range = getRange(totalPoints);

            return (
              <tr key={a.id} className={`border-t ${darkMode ? "border-gray-700 hover:bg-[#3a3a3a]" : "border-gray-200 hover:bg-gray-50"}`}>
                {/* Cliente con bolita de color */}
                <td className="p-3 flex items-center space-x-2">
                  <span className="font-semibold">{conv.customer_name}</span>
                  <div className={`w-3 h-3 rounded-full ${range.color}`} title={range.label}></div>
                  <span className="text-sm opacity-70">{range.label}</span>
                </td>

                {/* Ponderación editable */}
                <td className="p-3">
                  {editing === a.id ? (
                    <input
                      type="number"
                      min="0"
                      max="170"
                      value={newPonderacion}
                      onChange={(e) => setNewPonderacion(e.target.value)}
                      className={`w-20 px-2 py-1 border rounded-md ${darkMode ? "bg-[#1f1f1f] border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                    />
                  ) : (
                    <span className="font-medium">{totalPoints}</span>
                  )}
                </td>

                {/* Acciones */}
                <td className="p-3 text-center">
                  {editing === a.id ? (
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => {
                          onUpdatePonderacion(a.id, newPonderacion);
                          setEditing(null);
                        }}
                        className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className={`px-3 py-1 rounded-md text-sm ${darkMode ? "bg-gray-600 hover:bg-gray-500 text-white" : "bg-gray-300 hover:bg-gray-400"}`}
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditing(a.id);
                        setNewPonderacion(totalPoints);
                      }}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                    >
                      Editar
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
