const API_URL = "http://localhost:3001/api";

export async function getUsers() {
  const res = await fetch(`${API_URL}/users`);
  if (!res.ok) throw new Error("Error al obtener usuarios");
  return res.json();
}
