import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Messages from "./pages/MessagesPage";
import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login"; 
import Profile from "./pages/Profile";
import UsersPage from "./pages/UsersPage";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);

  // 🔹 Recuperar datos de localStorage al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedDarkMode = localStorage.getItem("darkMode");

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedDarkMode) setDarkMode(savedDarkMode === "true");
  }, []);

  // 🔹 Guardar usuario cuando cambie
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // 🔹 Guardar tema cuando cambie
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // 🔹 Si no hay usuario → mostrar login
  if (!user) {
    return <Login darkMode={darkMode} onLogin={setUser} />;
  }

  return (
    <Routes>
      <Route
        element={
          <Layout
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            user={user}
            setUser={setUser}
            onLogout={() => setUser(null)} 
          />
        }
      >
        <Route path="/home" element={<Home darkMode={darkMode} />} />
        <Route path="/messages" element={<Messages darkMode={darkMode} />} />
        <Route path="/settings" element={<Settings darkMode={darkMode} />} />
        <Route path="/dashboard" element={<Dashboard darkMode={darkMode} />} />
        <Route
          path="/profile"
          element={<Profile darkMode={darkMode} user={user} setUser={setUser} />}
        />
        {/* 🔹 Redirigir rutas inválidas al home */}
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/usuarios" element={<UsersPage darkMode={darkMode} />} />

      </Route>
    </Routes>
  );
}
