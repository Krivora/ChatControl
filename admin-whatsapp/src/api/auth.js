import { api } from "./client";

export async function login(email, password) {
  // api.post devuelve el JSON completo → { ok, data: { user, token } }
  return api.post("/users/login", { email, password });
}
