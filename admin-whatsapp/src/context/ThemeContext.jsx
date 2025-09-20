import { createContext, useContext, useEffect, useState } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { UsersApi } from "../api/users";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);

  // Al montar, sincronizar con localStorage o backend
  useEffect(() => {
    const initTheme = async () => {
      const userJson = localStorage.getItem("user");
      if (userJson) {
        try {
          const user = JSON.parse(userJson);

          // Opción 1: usar el valor ya guardado en localStorage
          if (typeof user.darkMode === "boolean") {
            setDarkMode(user.darkMode);
          }

          // Opción 2 (más confiable): pedir al backend
          const freshUser = await UsersApi.get(user.id);
          if (freshUser?.dark_mode !== undefined) {
            setDarkMode(freshUser.dark_mode);

            // refrescar localStorage.user también
            localStorage.setItem("user", JSON.stringify(freshUser));
          }
        } catch (err) {
          console.error("Error cargando theme del backend:", err);
        }
      } else {
        // fallback si no hay usuario
        const stored = localStorage.getItem("darkMode");
        if (stored !== null) setDarkMode(stored === "true");
      }
    };

    initTheme();
  }, []);

  // Aplicar cambios en <html> y localStorage
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = async () => {
    const newValue = !darkMode;
    setDarkMode(newValue);

    try {
      await UsersApi.updateDarkMode(newValue);

      // actualizar en localStorage.user también
      const userJson = localStorage.getItem("user");
      if (userJson) {
        const user = JSON.parse(userJson);
        localStorage.setItem("user", JSON.stringify({ ...user, darkMode: newValue }));
      }
    } catch (err) {
      console.error("Error actualizando dark mode en backend:", err);
    }
  };

  // Tema de MUI
  const muiTheme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: { main: "#960b2b" },
    },
  });

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, toggleDarkMode }}>
      <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
