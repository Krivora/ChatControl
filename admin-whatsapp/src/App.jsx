import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Messages from "./pages/MessagesPage";
import AppointmentsPage from "./pages/AppointmentPage";
import ConfigurationPage from "./pages/ConfigurationPage";
import UsersPage from "./pages/UsersPage";

import PrivateRoute from "./routes/PrivateRoute";
import Layout from "./components/Layout";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  // 🔹 Leer preferencia guardada en localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem("darkMode");
    if (storedTheme !== null) {
      setDarkMode(storedTheme === "true");
    }
  }, []);

  // 🔹 Guardar preferencia cuando cambie
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <Routes>
      <Route path="/login" element={<Login darkMode={darkMode} />} />

      <Route element={<PrivateRoute />}>
        <Route
          element={
            <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          }
        >
          <Route path="/" element={<Dashboard  darkMode={darkMode}toggleDarkMode={toggleDarkMode}/>} />
          <Route path="/messages" element={<Messages darkMode={darkMode}toggleDarkMode={toggleDarkMode}/>} />
          <Route path="/appointments" element={<AppointmentsPage darkMode={darkMode}toggleDarkMode={toggleDarkMode}/>} />
          <Route path="/configuration" element={<ConfigurationPage darkMode={darkMode}toggleDarkMode={toggleDarkMode}/>} />
          <Route path="/users" element={<UsersPage darkMode={darkMode}toggleDarkMode={toggleDarkMode}/>} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
