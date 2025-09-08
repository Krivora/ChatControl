import React, { useState } from "react";
import { Routes, Route } from "react-router-dom"; // <-- ya no BrowserRouter
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
  <Routes>
    <Route element={<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}>
      <Route path="/" element={<Home darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
      <Route path="/messages" element={<Messages darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
      <Route path="/settings" element={<Settings darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
      <Route path="/dashboard" element={<Dashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
    </Route>
  </Routes>

  );
}
