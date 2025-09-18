// src/api/whatsapp.js

const API_URL = "http://localhost:4000/api/whatsapp"; // ajusta si cambia


export const sendWhatsapp = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener conversaciones");
  const data = await res.json();

  return data.data || [];
};
