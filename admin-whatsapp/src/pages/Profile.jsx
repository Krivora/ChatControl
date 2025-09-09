// src/pages/Profile.jsx
import React, { useState } from "react";

export default function Profile({ darkMode, user, setUser }) {
  const [username, setUsername] = useState(user.username || "");
  const [email, setEmail] = useState(user.email || "");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(user.avatar || "");

  const handleSave = (e) => {
    e.preventDefault();

    // Guardar cambios en el "estado global" del usuario
    setUser({
      ...user,
      username,
      email,
      avatar,
      // Ojo: en un proyecto real no deberías guardar la contraseña en estado,
      // sino mandarla a tu API para actualizarla de forma segura.
    });

    alert("✅ Perfil actualizado con éxito");
  };

  const containerStyle = {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: darkMode ? "#1f1f1f" : "#fff",
    borderRadius: "10px",
    boxShadow: darkMode
      ? "0 2px 8px rgba(0,0,0,0.7)"
      : "0 2px 8px rgba(0,0,0,0.1)",
    color: darkMode ? "#fff" : "#333",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "8px",
    border: `1px solid ${darkMode ? "#444" : "#ccc"}`,
    backgroundColor: darkMode ? "#2a2a2a" : "#fff",
    color: darkMode ? "#fff" : "#333",
  };

  const buttonStyle = {
    padding: "12px 20px",
    backgroundColor: "#c3002f",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "10px",
  };

  return (
    <div style={containerStyle}>
      <h2>👤 Mi Perfil</h2>
      <form onSubmit={handleSave}>
        {/* Foto de perfil */}
        <div style={{ marginBottom: "20px", textAlign: "center" }}>
          <img
            src={avatar || "https://via.placeholder.com/100"}
            alt="avatar"
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: "10px",
            }}
          />
          <input
            type="text"
            placeholder="URL de la foto de perfil"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Nombre */}
        <label>Nombre de usuario</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={inputStyle}
        />

        {/* Correo */}
        <label>Correo</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        {/* Contraseña */}
        <label>Contraseña</label>
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle}>
          💾 Guardar cambios
        </button>
      </form>
    </div>
  );
}
