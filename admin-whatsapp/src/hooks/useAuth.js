import { useState } from "react";
import { login } from "../api";

export function useAuth() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null")
  );

  const loginUser = async (email, password) => {
    const res = await login(email, password);

    // ⚡ Aquí ya sí funciona
    const { user, token } = res.data;

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    setUser(user);

    return user;
  };

  const logoutUser = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return { user, loginUser, logoutUser };
}
