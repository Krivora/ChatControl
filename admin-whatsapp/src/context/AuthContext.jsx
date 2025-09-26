import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginRequest } from "../api"; // 👈 importamos tu api

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  // Al iniciar, cargar datos del localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (e) {
        console.error("Error parsing stored user:", e);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  // 👉 login
  const loginUser = async (email, password) => {
    try {
      const res = await loginRequest(email, password);
      const { user: loggedUser, token: jwtToken } = res.data;

      // Guardar en localStorage
      localStorage.setItem("user", JSON.stringify(loggedUser));
      localStorage.setItem("token", jwtToken);

      // Actualizar estado global
      setUser(loggedUser);
      setToken(jwtToken);

      navigate("/"); // redirige al dashboard
      return loggedUser;
    } catch (err) {
      console.error("Login error:", err);
      throw err; // lo manejas en tu formulario
    }
  };

  // 👉 logout
  const logoutUser = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para consumir el contexto
export function useAuth() {
  return useContext(AuthContext);
}
