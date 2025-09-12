import React, { useState } from "react";
import logoLight from "../assets/logo.png"; // reemplaza con tu logo claro
import logoDark from "../assets/logo.png";   // reemplaza con tu logo oscuro

export default function Login({ darkMode, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Error al iniciar sesión");
    } else {
      onLogin(data); // guarda info del usuario logueado
    }
  } catch (err) {
    console.error(err);
    setError("Error de conexión");
  }
};


  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: darkMode ? "#121212" : "#f0f2f5",
    padding: "20px",
    fontFamily: "'Roboto', sans-serif",
  };

  const cardStyle = {
    backgroundColor: darkMode ? "#1f1f1f" : "#fff",
    padding: window.innerWidth < 360 ? "30px 20px" : "40px 30px",
    borderRadius: "15px",
    boxShadow: darkMode
      ? "0 4px 20px rgba(0,0,0,0.5)"
      : "0 4px 20px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
  };


  const logoStyle = {
    width: "120px",
    marginBottom: "20px",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 15px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "1px solid",
    borderColor: darkMode ? "#333" : "#ccc",
    backgroundColor: darkMode ? "#2a2a2a" : "#f9f9f9",
    color: darkMode ? "#fff" : "#333",
    fontSize: "16px",
    outline: "none",
    transition: "border 0.2s",
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    marginTop: "15px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#e30039",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s",
  };

  const titleStyle = {
    marginBottom: "20px",
    fontSize: "24px",
    fontWeight: "700",
    color: darkMode ? "#fff" : "#333",
  };

  const errorStyle = {
    color: "#ff4d4f",
    marginTop: "10px",
    fontWeight: "500",
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <img
          src={darkMode ? logoDark : logoLight}
          alt="Logo"
          style={logoStyle}
        />
        <h1 style={titleStyle}>🔐 Iniciar Sesión</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>
            Ingresar
          </button>
        </form>
        {error && <p style={errorStyle}>{error}</p>}
      </div>
    </div>
  );
}
