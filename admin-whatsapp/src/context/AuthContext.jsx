import { createContext, useContext, useState, useEffect } from "react";

// Crear el contexto
const AuthContext = createContext();

// Hook para usar el contexto más fácil
export function useAuth() {
  return useContext(AuthContext);
}

// Provider
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Cargar usuario de localStorage o API al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    // opcional: hacer logout en el backend
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
