const BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // puede no traer body
  }

  // ⚡ Manejo de errores
  if (!res.ok) {
    // Si el token es inválido o expiró
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirige al login solo si no estás ya ahí
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    const msg = data?.message || `Error ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

export const api = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  del: (path) => request(path, { method: "DELETE" }),
};
