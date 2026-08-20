import { useCallback, useEffect, useRef, useState } from "react";
import { ReportsApi } from "../api/reports";

// Rangos preestablecidos del filtro. `days: null` = desde el inicio del mes.
export const DATE_PRESETS = [
  { id: "7d", label: "Últimos 7 días", days: 7 },
  { id: "30d", label: "Últimos 30 días", days: 30 },
  { id: "90d", label: "Últimos 90 días", days: 90 },
  { id: "mtd", label: "Mes en curso", days: null },
  { id: "365d", label: "Último año", days: 365 },
];

const pad = (n) => String(n).padStart(2, "0");

// Día local en YYYY-MM-DD. Comparar cadenas evita los corrimientos de zona
// horaria que produce toISOString() (mismo criterio que el Dashboard).
export const toLocalDay = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const rangeFromPreset = (presetId) => {
  const today = new Date();
  const to = toLocalDay(today);

  if (presetId === "mtd") {
    return { from: toLocalDay(new Date(today.getFullYear(), today.getMonth(), 1)), to };
  }

  const preset = DATE_PRESETS.find((p) => p.id === presetId) || DATE_PRESETS[1];
  const from = new Date(today);
  from.setDate(from.getDate() - (preset.days - 1));
  return { from: toLocalDay(from), to };
};

// Tablero completo. `refreshing` se distingue de `loading` para poder mantener
// la vista anterior atenuada al cambiar el rango, en vez de parpadear vacía.
export function useReports(initialPreset = "30d") {
  const [range, setRange] = useState(() => rangeFromPreset(initialPreset));
  const [granularity, setGranularity] = useState("auto");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Una respuesta lenta de un rango anterior no debe pisar a la más reciente.
  const requestId = useRef(0);

  const fetchOverview = useCallback(async () => {
    const id = ++requestId.current;
    setError(null);
    setRefreshing(true);

    try {
      const res = await ReportsApi.overview({
        from: range.from,
        to: range.to,
        granularity: granularity === "auto" ? undefined : granularity,
      });
      if (id !== requestId.current) return;
      setData(res.data);
    } catch (err) {
      if (id !== requestId.current) return;
      console.error("Error al cargar reportes:", err);
      setError(err.message || "No se pudieron cargar los reportes");
    } finally {
      if (id === requestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [range.from, range.to, granularity]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return {
    data,
    loading,
    refreshing,
    error,
    range,
    setRange,
    granularity,
    setGranularity,
    reload: fetchOverview,
  };
}

// Dataset tabular paginado, para la pestaña de extracción de datos.
export function useDataset({ type, range, q, page, pageSize, reloadToken = 0 }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  useEffect(() => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);

    ReportsApi.dataset({ type, from: range.from, to: range.to, q, page, pageSize })
      .then((res) => {
        if (id !== requestId.current) return;
        setResult({ ...res.data, meta: res.meta });
      })
      .catch((err) => {
        if (id !== requestId.current) return;
        console.error("Error al cargar el dataset:", err);
        setError(err.message || "No se pudo cargar el reporte");
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
  }, [type, range.from, range.to, q, page, pageSize, reloadToken]);

  return { result, loading, error };
}
