
import { api } from "./client";


export const sendWhatsapp = async () => {
  const res = await fetch(api);
  if (!res.ok) throw new Error("Error al obtener conversaciones");
  const data = await res.json();

  return data.data || [];
};
