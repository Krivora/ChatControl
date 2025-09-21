import { useState } from "react";
import { login } from "../api";
import { useTheme } from "../context/ThemeContext";

export function useAuth() {
  let initialUser = null;
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      initialUser = JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error parsing user from localStorage:", e);
    localStorage.removeItem("user"); // limpiar dato corrupto
  }

  const [user, setUser] = useState(initialUser);
  const { setDarkMode } = useTheme();

  const loginUser = async (email, password) => {
    const res = await login(email, password);

    // 👇 Desestructuramos desde res.data
    const { user: loggedUser, token } = res.data;

    // Guardar en localStorage
    localStorage.setItem("user", JSON.stringify(loggedUser));
    localStorage.setItem("token", token);

    // Actualizar estado global
    setUser(loggedUser);
    setDarkMode(loggedUser.darkMode);

    return loggedUser;
  };

  const logoutUser = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setDarkMode(false);
  };

  const isAuthenticated = !!user;

  return { user, loginUser, logoutUser, isAuthenticated };
}
