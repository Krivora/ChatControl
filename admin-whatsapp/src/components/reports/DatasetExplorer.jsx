import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "@mui/icons-material";
import DownloadIcon from "@mui/icons-material/Download";
import DataObjectIcon from "@mui/icons-material/DataObject";
import GridOnIcon from "@mui/icons-material/GridOn";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import Pagination from "../common/TablePagination";
import { ReportsApi } from "../../api/reports";
import { useDataset } from "../../hooks/useReports";
import { useDebounce } from "../../hooks/useDebounce";
import { useAlert } from "../../utils/alert";
import { downloadCsv, downloadJson, exportFilename, formatValue } from "../../utils/exportData";
import { downloadExcel } from "../../utils/exportExcel";

const nf = new Intl.NumberFormat("es-MX");

const DATASETS = [
  { id: "leads", label: "Leads / clientes" },
  { id: "conversations", label: "Conversaciones" },
  { id: "appointments", label: "Citas" },
  { id: "assignments", label: "Asignaciones" },
  { id: "messages", label: "Mensajes" },
  { id: "answers", label: "Respuestas del bot" },
];

export default function DatasetExplorer({ range, reloadToken, darkMode }) {
  const { showSnack } = useAlert();
  const [type, setType] = useState("leads");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [hidden, setHidden] = useState({});
  const [pickerOpen, setPickerOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const pickerRef = useRef(null);

  const debouncedSearch = useDebounce(search, 400);

  const { result, loading, error } = useDataset({
    type,
    range,
    q: debouncedSearch,
    page,
    pageSize,
    reloadToken,
  });

  // Cualquier cambio de filtro invalida la página en la que estabas.
  useEffect(() => setPage(1), [type, debouncedSearch, pageSize, range.from, range.to]);

  // Las columnas ocultas son por dataset: al cambiar de reporte se reinician.
  useEffect(() => setHidden({}), [type]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Las columnas las declara el backend según el dataset; el usuario solo
  // decide cuáles se muestran (y cuáles entran a la exportación).
  const allColumns = useMemo(() => result?.columns || [], [result]);
  const columns = useMemo(
    () => allColumns.filter((c) => !hidden[c.key]),
    [allColumns, hidden]
  );
  const rows = result?.rows || [];
  const meta = result?.meta;

  const field = darkMode
    ? "bg-[#2a2a2a] text-gray-200 border-gray-700"
    : "bg-gray-100 text-gray-700 border-gray-200";

  const button = `px-3 py-2 rounded-lg text-sm border flex items-center gap-2 transition-colors disabled:opacity-50 ${field}`;

  // Exporta el rango completo, no solo la página visible: para eso se pide de
  // nuevo el dataset con el tope que declara el backend.
  const exportAll = async (format) => {
    if (!meta) return;
    setExporting(true);
    try {
      const res = await ReportsApi.dataset({
        type,
        from: range.from,
        to: range.to,
        q: debouncedSearch,
        page: 1,
        pageSize: meta.maxExportRows,
      });
      const data = res.data;
      const visible = data.columns.filter((c) => !hidden[c.key]);
      const base = `${type}-${range.from}_${range.to}`;

      const label = DATASETS.find((d) => d.id === type)?.label || type;

      if (format === "json") {
        downloadJson(exportFilename(base, "json"), {
          reporte: type,
          rango: range,
          total: res.meta?.total ?? data.rows.length,
          filas: data.rows,
        });
      } else if (format === "xlsx") {
        await downloadExcel(exportFilename(base, "xlsx"), [
          { name: label, columns: visible, rows: data.rows },
        ]);
      } else {
        downloadCsv(exportFilename(base, "csv"), visible, data.rows);
      }

      const truncated = (res.meta?.total ?? 0) > data.rows.length;
      showSnack(
        truncated
          ? `Se exportaron ${nf.format(data.rows.length)} de ${nf.format(
              res.meta.total
            )} filas (tope del sistema). Acota el rango para obtener el resto.`
          : `Se exportaron ${nf.format(data.rows.length)} filas`,
        truncated ? "warning" : "success"
      );
    } catch (err) {
      console.error(err);
      showSnack(err.message || "No se pudo exportar", "error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Selector de reporte */}
      <div className="flex flex-wrap gap-2 print:hidden">
        {DATASETS.map((d) => (
          <button
            key={d.id}
            onClick={() => setType(d.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              type === d.id
                ? "bg-[#960b2b] text-white"
                : darkMode
                ? "bg-[#2a2a2a] text-gray-300 hover:bg-[#333]"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div
        className={`rounded-2xl border shadow-sm overflow-hidden ${
          darkMode ? "bg-[#1a1a1a] border-gray-800" : "bg-white border-gray-100"
        }`}
      >
        <div className="p-3 flex flex-wrap items-center gap-3 print:hidden">
          <div className="relative w-full sm:w-64">
            <Search
              fontSize="small"
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en el reporte..."
              className={`pl-10 pr-3 py-2 rounded-lg text-sm w-full border ${field}`}
            />
          </div>

          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className={`px-2 py-2 rounded-lg text-sm border ${field}`}
          >
            {[25, 50, 100, 200].map((n) => (
              <option key={n} value={n}>
                {n} por página
              </option>
            ))}
          </select>

          {/* Selector de columnas: en una extracción rara vez se quieren todas */}
          <div className="relative" ref={pickerRef}>
            <button onClick={() => setPickerOpen((v) => !v)} className={button}>
              <ViewColumnIcon fontSize="small" />
              Columnas
            </button>
            {pickerOpen && (
              <div
                className={`absolute z-20 mt-1 w-60 max-h-72 overflow-y-auto rounded-xl border shadow-lg p-2 ${
                  darkMode
                    ? "bg-[#1f1f1f] border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                {allColumns.map((c) => (
                  <label
                    key={c.key}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm cursor-pointer ${
                      darkMode ? "hover:bg-[#2a2a2a]" : "hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!hidden[c.key]}
                      onChange={() =>
                        setHidden((prev) => ({ ...prev, [c.key]: !prev[c.key] }))
                      }
                      className="accent-[#960b2b]"
                    />
                    <span className="truncate">{c.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1" />

          <button
            onClick={() => exportAll("xlsx")}
            disabled={exporting || !meta?.total}
            className={button}
            title="Descargar todo el rango en Excel"
          >
            <GridOnIcon fontSize="small" />
            {exporting ? "Exportando..." : "Excel"}
          </button>

          <button
            onClick={() => exportAll("csv")}
            disabled={exporting || !meta?.total}
            className={button}
            title="Descargar todo el rango en CSV"
          >
            <DownloadIcon fontSize="small" />
            CSV
          </button>

          <button
            onClick={() => exportAll("json")}
            disabled={exporting || !meta?.total}
            className={button}
            title="Descargar todo el rango en JSON"
          >
            <DataObjectIcon fontSize="small" />
            JSON
          </button>
        </div>

        {error && (
          <p className="px-5 py-8 text-center text-sm text-[#d03b3b]">{error}</p>
        )}

        {!error && (
          <>
            <div className="overflow-x-auto">
              {/* Se mantiene la tabla anterior atenuada mientras recarga, en
                  vez de vaciarla y provocar un salto de layout. */}
              <table
                className={`w-full border-collapse text-left text-sm transition-opacity ${
                  loading ? "opacity-50" : "opacity-100"
                }`}
              >
                <thead
                  className={`text-xs font-semibold uppercase ${
                    darkMode ? "bg-[#2a2a2a] text-gray-300" : "bg-gray-50 text-gray-500"
                  }`}
                >
                  <tr>
                    {columns.map((c) => (
                      <th key={c.key} className="px-4 py-3 whitespace-nowrap">
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    darkMode ? "divide-gray-800" : "divide-gray-100"
                  }`}
                >
                  {rows.map((row, i) => (
                    <tr
                      key={row.id ?? `${i}-${row[columns[0]?.key]}`}
                      className={darkMode ? "hover:bg-[#242424]" : "hover:bg-gray-50"}
                    >
                      {columns.map((c) => {
                        const text = formatValue(row[c.key]);
                        return (
                          <td
                            key={c.key}
                            title={text}
                            className="px-4 py-3 max-w-[280px] truncate tabular-nums"
                          >
                            {text || <span className="text-gray-400">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!rows.length && !loading && (
              <p className="px-5 py-10 text-center text-sm text-gray-400">
                No hay registros con estos filtros.
              </p>
            )}

            <div
              className={`flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-t print:hidden ${
                darkMode ? "border-gray-800" : "border-gray-100"
              }`}
            >
              <span className="text-xs text-gray-400">
                {meta
                  ? `${nf.format(meta.total)} registros · página ${meta.page} de ${meta.totalPages}`
                  : ""}
              </span>
              <Pagination
                page={page}
                totalPages={meta?.totalPages || 1}
                onChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
