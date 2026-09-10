// src/api/customers.js
import { api } from "./client";

export const CustomersApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/customers${qs ? `?${qs}` : ""}`);
  },
  get: (id) => api.get(`/customers/${id}`),
  update: (id, payload) => api.put(`/customers/${id}`, payload),
  rename: (id, full_name) => api.put(`/customers/${id}`, { full_name }),
};

/**
 * Total de clientes registrados, leído del `meta` de la paginación.
 *
 * Antes esto usaba `fetch` directo con `import.meta.env.VITE_API_BASE_URL` y
 * su propia cabecera Authorization, saltándose el cliente HTTP: se quedaba
 * fuera del manejo central de 401 y del fallback de la URL base.
 */
export const getTotalClientes = async () => {
  const res = await CustomersApi.list({ page: 1, pageSize: 1 });
  return res?.meta?.total ?? 0;
};
