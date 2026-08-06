// src/api/customers.js
import { api } from "./client";

export const CustomersApi = {
  get: (id) => api.get(`/customers/${id}`),
  update: (id, payload) => api.put(`/customers/${id}`, payload),
  rename: (id, full_name) => api.put(`/customers/${id}`, { full_name }),
};

// customers.js
export const getTotalClientes = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/customers?page=1&pageSize=1`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!res.ok) throw new Error("Error fetching total clientes");

    const data = await res.json();
    return data.meta.total; // <-- aquí está el total de clientes
  } catch (err) {
    console.error(err);
    throw err;
  }
};
