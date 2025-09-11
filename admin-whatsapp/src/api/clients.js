const API_URL = "http://localhost:5000/api";

export async function getClients() {
  const res = await fetch(`${API_URL}/clients`);
  if (!res.ok) throw new Error("Error al obtener clientes");
  return res.json();
}

export async function getClientMessages(clientId) {
  const res = await fetch(`${API_URL}/clients/${clientId}/messages`);
  if (!res.ok) throw new Error("Error al obtener mensajes del cliente");
  return res.json();
}
