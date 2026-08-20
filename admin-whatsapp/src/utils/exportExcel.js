// Generación de archivos .xlsx.
//
// A diferencia del CSV, aquí los valores conservan su tipo: los números se
// pueden sumar y las fechas se pueden ordenar y filtrar como fechas dentro de
// Excel, en vez de llegar como texto.
import { downloadBlob, parseCell } from "./exportData";

const DATE_FORMAT = "dd/mm/yyyy";
const DATETIME_FORMAT = "dd/mm/yyyy hh:mm";

// Ancho de columna en "caracteres": se estima con el encabezado y una muestra
// de filas para no recorrer un dataset de miles de renglones.
const MIN_WIDTH = 10;
const MAX_WIDTH = 46;
const WIDTH_SAMPLE = 60;

// `convertDateToSerialNumber` de la librería usa getTime(), que es UTC. Las
// fechas de Postgres llegan en hora local, así que hay que compensar el offset
// o un timestamp de las 03:00 aparecería en Excel como las 10:00.
const toExcelDate = (date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60_000);

const toExcelCell = (value) => {
  const cell = parseCell(value);

  switch (cell.kind) {
    case "empty":
      return { value: null };
    case "boolean":
      return { type: Boolean, value: cell.value };
    case "number":
      return { type: Number, value: cell.value };
    case "date":
      return { type: Date, value: toExcelDate(cell.value), format: DATE_FORMAT };
    case "datetime":
      return { type: Date, value: toExcelDate(cell.value), format: DATETIME_FORMAT };
    default:
      return { type: String, value: cell.value };
  }
};

const estimateWidth = (column, rows) => {
  let longest = String(column.label).length;
  for (const row of rows.slice(0, WIDTH_SAMPLE)) {
    const cell = parseCell(row[column.key]);
    const length =
      cell.kind === "date" ? 10 : cell.kind === "datetime" ? 16 : String(cell.value ?? "").length;
    if (length > longest) longest = length;
  }
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, longest + 2));
};

// Excel no acepta : \ / ? * [ ] en el nombre de una hoja, ni más de 31
// caracteres. Un nombre inválido hace que el archivo no abra.
const safeSheetName = (name) =>
  String(name).replace(/[:\\/?*[\]]/g, " ").slice(0, 31) || "Hoja";

const buildSheet = ({ name, columns, rows }) => ({
  sheet: safeSheetName(name),
  // Encabezado congelado: en un reporte de miles de filas es lo primero que
  // se pierde al hacer scroll.
  stickyRowsCount: 1,
  columns: columns.map((c) => ({ width: estimateWidth(c, rows) })),
  data: [
    columns.map((c) => ({ value: c.label, fontWeight: "bold" })),
    ...rows.map((row) => columns.map((c) => toExcelCell(row[c.key]))),
  ],
});

// La librería solo se descarga cuando el usuario exporta: son ~90 KB que no
// tienen por qué pesar en la carga inicial del panel.
export const downloadExcel = async (filename, sheets) => {
  const { default: writeExcelFile } = await import("write-excel-file/universal");
  const blob = await writeExcelFile(sheets.map(buildSheet)).toBlob();
  downloadBlob(filename, blob);
};
