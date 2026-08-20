// Formateo y descarga de datasets. Lo usan por igual la tabla y la
// exportación, para que el CSV diga exactamente lo mismo que la pantalla.

const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SQL_TIME = /^\d{2}:\d{2}(:\d{2})?$/;

const pad = (n) => String(n).padStart(2, "0");

// Postgres devuelve los `timestamp without time zone` y los `date` como fechas
// en hora local, así que se leen con getters locales: usar toISOString() aquí
// corre el día hacia atrás en México.
const formatDate = (d, withTime) => {
  const base = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  if (!withTime) return base;
  return `${base} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Clasifica un valor crudo del backend una sola vez. La tabla, el CSV y el
// Excel parten de aquí, así que los tres coinciden en qué es cada celda.
export const parseCell = (value) => {
  if (value === null || value === undefined || value === "") {
    return { kind: "empty" };
  }
  if (typeof value === "boolean") return { kind: "boolean", value };
  if (typeof value === "number") return { kind: "number", value };

  const str = String(value);

  if (ISO_DATETIME.test(str)) {
    const date = new Date(str);
    if (!isNaN(date)) {
      // Las columnas de tipo `date` llegan a medianoche local: sin hora útil.
      const isMidnight =
        date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0;
      return { kind: isMidnight ? "date" : "datetime", value: date };
    }
  }
  if (ISO_DATE.test(str)) {
    return { kind: "date", value: new Date(`${str}T00:00:00`) };
  }
  if (SQL_TIME.test(str)) return { kind: "time", value: str.slice(0, 5) };

  return { kind: "text", value: str };
};

export const formatValue = (value) => {
  const cell = parseCell(value);
  switch (cell.kind) {
    case "empty":
      return "";
    case "boolean":
      return cell.value ? "Sí" : "No";
    case "number":
      return String(cell.value);
    case "date":
      return formatDate(cell.value, false);
    case "datetime":
      return formatDate(cell.value, true);
    default:
      return cell.value;
  }
};

// Excel en español interpreta el separador por la configuración regional; el
// punto y coma más el BOM UTF-8 es lo que abre bien sin pasos extra.
const SEPARATOR = ";";

const escapeCell = (value) => {
  const text = formatValue(value);
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const toCsv = (columns, rows) => {
  const header = columns.map((c) => escapeCell(c.label)).join(SEPARATOR);
  const body = rows.map((row) =>
    columns.map((c) => escapeCell(row[c.key])).join(SEPARATOR)
  );
  return [header, ...body].join("\r\n");
};

export const downloadBlob = (filename, blob) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const download = (filename, content, mime) =>
  downloadBlob(filename, new Blob([content], { type: `${mime};charset=utf-8` }));

// Sin el BOM, Excel abre el CSV en ANSI y rompe los acentos.
const BOM = "\uFEFF";

export const downloadCsv = (filename, columns, rows) =>
  download(filename, `${BOM}${toCsv(columns, rows)}`, "text/csv");

export const downloadJson = (filename, data) =>
  download(filename, JSON.stringify(data, null, 2), "application/json");

// Nombre con marca de tiempo para que dos descargas no se pisen.
export const exportFilename = (base, extension) => {
  const now = new Date();
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(
    now.getHours()
  )}${pad(now.getMinutes())}`;
  return `${base}-${stamp}.${extension}`;
};
