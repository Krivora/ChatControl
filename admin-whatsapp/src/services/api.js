const API_URL = "https://tubackend.com/api";

export async function getClients() {
  const res = await fetch(`${API_URL}/clients`);
  return res.json();
}

export async function getMessages(clientId) {
  const res = await fetch(`${API_URL}/clients/${clientId}/messages`);
  return res.json();
}

export async function sendMessage(clientId, message) {
  const res = await fetch(`${API_URL}/clients/${clientId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return res.json();
}
