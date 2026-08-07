// Ponderación de respuestas del bot. Vivía duplicada en ConversationList,
// CustomerInfo y las tablas de asignaciones.

export const MAX_SCORE = 170;

export const questionLabels = {
  down_payment_max: "Enganche máximo",
  max_monthly_payment: "Pago mensual máximo",
  credit_bureau_status: "Estatus en buró de crédito",
  time_to_buy: "Tiempo estimado de compra",
};

export const ponderacionMap = {
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

// Las etiquetas traen espacios, comas y guiones de distinto tipo según de
// dónde vengan; se normaliza todo antes de comparar.
const normalize = (str) =>
  String(str || "")
    .toLowerCase()
    .replace(/\s/g, "")
    .replace(/,/g, "")
    .replace(/\$/g, "")
    .replace(/–|-/g, "-");

export const pointsFor = (answer) => {
  const options = ponderacionMap[answer?.question_key] || [];
  const matched = options.find(
    (opt) => normalize(opt.label) === normalize(answer?.answer_value)
  );
  return matched?.points || 0;
};

export const calculatePoints = (answers = []) =>
  answers.reduce((sum, a) => sum + pointsFor(a), 0);

export const scoreRanges = [
  { min: 0, max: 50, label: "Malo", dot: "bg-red-500", bar: "bg-red-500", chip: "bg-red-100 text-red-700" },
  { min: 51, max: 100, label: "Regular", dot: "bg-yellow-400", bar: "bg-yellow-400", chip: "bg-yellow-100 text-yellow-700" },
  { min: 101, max: 140, label: "Bien", dot: "bg-green-500", bar: "bg-green-500", chip: "bg-green-100 text-green-700" },
  { min: 141, max: MAX_SCORE, label: "Excelente", dot: "bg-blue-500", bar: "bg-blue-500", chip: "bg-blue-100 text-blue-700" },
];

export const getRange = (points) =>
  scoreRanges.find((r) => points >= r.min && points <= r.max) || scoreRanges[0];

// "Jose Reyna" -> "JR"
export const initials = (name) => {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
};

export const formatPhone = (phone) => {
  if (!phone) return "No disponible";
  const digits = String(phone).replace(/\D/g, "");
  const local = digits.slice(-10);
  if (local.length !== 10) return String(phone);
  return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6, 10)}`;
};
