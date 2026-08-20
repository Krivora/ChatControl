// Ponderación de las respuestas del bot.
// Espejo de admin-whatsapp/src/utils/scoring.js: el frontend la usa para pintar
// los chips y aquí se necesita para agregar los reportes sin traerse todas las
// conversaciones al navegador.

export const MAX_SCORE = 170;

export const questionLabels = {
  name_question: 'Nombre',
  type_purchase: 'Tipo de compra',
  type_car: 'Tipo de auto',
  brand_model: 'Marca / modelo',
  time_to_buy: 'Tiempo estimado de compra',
  down_payment_max: 'Enganche máximo',
  max_monthly_payment: 'Pago mensual máximo',
  credit_bureau_status: 'Estatus en buró de crédito',
  max_investment: 'Inversión máxima',
  post_profiling_action: 'Acción posterior',
  day_appointment: 'Día de cita',
  appoinment_time: 'Hora de cita',
};

export const ponderacionMap = {
  down_payment_max: [
    { label: '$30,000 – $50,000', points: 15 },
    { label: '$50,000 – $70,000', points: 15 },
    { label: '$70,000 – $100,000', points: 20 },
    { label: '$100,000 – $200,000', points: 25 },
    { label: '$200,000 o más', points: 25 },
  ],
  max_monthly_payment: [
    { label: '$4,000 – $5,500', points: 25 },
    { label: '$5,500 – $7,000', points: 25 },
    { label: '$7,000 – $9,000', points: 25 },
    { label: '$9,000 o más', points: 25 },
  ],
  credit_bureau_status: [
    { label: 'mal', points: 5 },
    { label: 'regular', points: 15 },
    { label: 'bien', points: 30 },
    { label: 'excelente', points: 50 },
  ],
  time_to_buy: [
    { label: 'Ya estoy listo', points: 70 },
    { label: 'De 1 a 15 días', points: 15 },
    { label: 'De 15 a 30 días', points: 10 },
    { label: 'Más de 30 días', points: 5 },
  ],
};

// Las etiquetas llegan con espacios, comas y guiones de distinto tipo según de
// dónde vengan; se normaliza todo antes de comparar.
const normalize = (str) =>
  String(str || '')
    .toLowerCase()
    .replace(/\s/g, '')
    .replace(/,/g, '')
    .replace(/\$/g, '')
    .replace(/–|-/g, '-');

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
  { min: 0, max: 50, label: 'Malo' },
  { min: 51, max: 100, label: 'Regular' },
  { min: 101, max: 140, label: 'Bien' },
  { min: 141, max: MAX_SCORE, label: 'Excelente' },
];

export const getRange = (points) =>
  scoreRanges.find((r) => points >= r.min && points <= r.max) || scoreRanges[0];
