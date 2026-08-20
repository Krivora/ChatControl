import { api } from "./client";

// `api.get` solo recibe la ruta, así que los filtros se serializan aquí (mismo
// criterio que appointments.js).
const toQuery = (params = {}) => {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  const qs = new URLSearchParams(entries).toString();
  return qs ? `?${qs}` : "";
};

export const ReportsApi = {
  // Todo el tablero en una sola llamada: KPIs, series, embudo y desgloses.
  overview: (params = {}) => api.get(`/reports/overview${toQuery(params)}`),

  // Catálogo de datasets exportables.
  datasets: () => api.get("/reports/datasets"),

  // Dataset tabular. `pageSize` grande = extracción para exportar.
  dataset: (params = {}) => api.get(`/reports/dataset${toQuery(params)}`),
};
