import React from "react";

export default function Settings({ darkMode }) {
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    textAlign: "center",
    padding: "20px",
    backgroundColor: darkMode ? "#121212" : "#f5f5f5",
    color: darkMode ? "#fff" : "#333",
    fontFamily: "'Roboto', sans-serif",
    transition: "all 0.3s",
  };

  const titleStyle = {
    fontSize: "48px",
    marginBottom: "20px",
    color: darkMode ? "#fff" : "#111",
  };

  const mainTextStyle = {
    fontSize: "20px",
    marginBottom: "10px",
  };

  const subTextStyle = {
    fontSize: "16px",
    color: darkMode ? "#bbb" : "#555",
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>⚙️ Configuración</h1>
      <p style={mainTextStyle}>🚧 Esta sección está en desarrollo</p>
      <p style={subTextStyle}>Pronto podrás acceder a todas las configuraciones.</p>
    </div>
  );
}
