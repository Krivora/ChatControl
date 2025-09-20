import React from "react";

export default function UserList({ users, darkMode, onEdit }) {
  if (!users || users.length === 0) return <div style={{ color: darkMode ? "#ccc" : "#555", padding: 10 }}>No hay usuarios aún.</div>;

  return (
    <div style={{ backgroundColor: darkMode ? "#1a1a1a" : "#fff", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ display: "flex", padding: 10, fontWeight: "bold", borderBottom: `1px solid ${darkMode ? "#333" : "#ddd"}`, color: darkMode ? "#fff" : "#222", backgroundColor: darkMode ? "#2a2a2a" : "#eee" }}>
        <span style={{ flex: 1 }}>Nombre</span>
        <span style={{ flex: 1 }}>Email</span>
        <span style={{ flex: 1 }}>Teléfono</span>
        <span style={{ flex: 1 }}>Acciones</span>
      </div>

      {users.map(u => (
        <div key={u.id} style={{ display: "flex", padding: 10, borderBottom: `1px solid ${darkMode ? "#333" : "#ddd"}`, color: darkMode ? "#fff" : "#222", alignItems: "center" }}>
          <span style={{ flex: 1 }}>{`${u.nombre} ${u.apellido}`}</span>
          <span style={{ flex: 1 }}>{u.email}</span>
          <span style={{ flex: 1 }}>{u.telefono}</span>
          <span style={{ flex: 1 }}>
            <button onClick={() => onEdit(u)} style={{ padding: "5px 10px", borderRadius: 6, border: "none", backgroundColor: "#1e90ff", color: "#fff", cursor: "pointer" }}>Editar</button>
          </span>
        </div>
      ))}
    </div>
  );
}
