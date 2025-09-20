import { useState } from "react";
import { login } from "../api";
import { useTheme } from "../context/ThemeContext";

export function useAuth() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const { setDarkMode } = useTheme(); // 👈 para aplicar el tema desde el backend

  const loginUser = async (email, password) => {
    const res = await login(email, password);

    // el backend devuelve: { user, token }
    const { user: loggedUser, token } = res;

    // guardar en localStorage
    localStorage.setItem("user", JSON.stringify(loggedUser));
    localStorage.setItem("token", token);

    // actualizar estado global
    setUser(loggedUser);
    setDarkMode(loggedUser.darkMode); // 👈 aplicar el darkMode correcto

    return loggedUser;
  };

  const logoutUser = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setDarkMode(false); // 👈 opcional: vuelve al modo claro al salir
  };

  return { user, loginUser, logoutUser };
}
