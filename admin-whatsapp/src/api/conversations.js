// src/api/conversations.js

const API_URL = "http://localhost:4000/api/conversations"; // ajusta si cambia


export const getConversations = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener conversaciones");
  const data = await res.json();
  console.log("Conversations fetched:", data); // 🔍

  // ✅ Aquí el arreglo viene directo en `data.data`
  return data.data || [];
};


export const getConversationDetail = async (id) => {
  const res = await fetch(`${API_URL}/${id}/full`);
  if (!res.ok) throw new Error("Error al obtener detalle de conversación");
  const data = await res.json();
  return data.data; // detalle con { customer, messages, ponderacion, answers }
};
