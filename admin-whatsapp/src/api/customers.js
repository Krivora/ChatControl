// src/api/customers.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // <-- esto faltaba

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
