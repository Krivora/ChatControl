import React, { useState, useEffect } from "react";

export default function UsersPage({ darkMode }) {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    id: null, // Para editar
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    fecha_nacimiento: "",
    genero: "",
    password: "",
  });

  // 🔹 Obtener usuarios
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔹 Editar usuario (abre modal con datos precargados)
  const handleEdit = (user) => {
    setForm({
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      telefono: user.telefono,
      fecha_nacimiento: user.fecha_nacimiento,
      genero: user.genero,
      password: "", // Vacío para no sobrescribir
    });
    setShowModal(true);
  };

  // 🔹 Crear o actualizar usuario
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = form.id
        ? `http://localhost:5000/api/users/${form.id}` // PUT para editar
        : "http://localhost:5000/api/users"; // POST para crear
      const method = form.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        return alert(data.message);
      }

      // Reset formulario y cerrar modal
      setForm({
        id: null,
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        fecha_nacimiento: "",
        genero: "",
        password: "",
      });
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Error creando/actualizando usuario");
    }
  };

  return (
    <div
      style={{
        padding: 20,
        backgroundColor: darkMode ? "#222" : "#f4f4f4",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ color: darkMode ? "#fff" : "#222" }}>Usuarios</h2>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "8px 15px",
            borderRadius: 6,
            border: "none",
            backgroundColor: "#960b2b",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          + Agregar Usuario
        </button>
      </div>

      {/* 🔹 Tabla */}
      <div
        style={{
          backgroundColor: darkMode ? "#1a1a1a" : "#fff",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            padding: "10px 15px",
            fontWeight: "bold",
            borderBottom: "1px solid",
            borderColor: darkMode ? "#333" : "#ddd",
            color: darkMode ? "#fff" : "#222",
            backgroundColor: darkMode ? "#2a2a2a" : "#eee",
          }}
        >
          <span style={{ flex: 1 }}>Nombre</span>
          <span style={{ flex: 1 }}>Email</span>
          <span style={{ flex: 1 }}>Teléfono</span>
          <span style={{ flex: 1 }}>Acciones</span>
        </div>

        {/* Body */}
        <div>
          {users.length === 0 ? (
            <div style={{ padding: "10px 15px", color: darkMode ? "#ccc" : "#555" }}>
              No hay usuarios aún.
            </div>
          ) : (
            users.map((u) => (
              <div
                key={u.id}
                style={{
                  display: "flex",
                  padding: "10px 15px",
                  borderBottom: "1px solid",
                  borderColor: darkMode ? "#333" : "#ddd",
                  color: darkMode ? "#fff" : "#222",
                  alignItems: "center",
                }}
              >
                <span style={{ flex: 1 }}>{`${u.nombre} ${u.apellido}`}</span>
                <span style={{ flex: 1 }}>{u.email}</span>
                <span style={{ flex: 1 }}>{u.telefono}</span>
                <span style={{ flex: 1 }}>
                  <button
                    onClick={() => handleEdit(u)}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 6,
                      border: "none",
                      backgroundColor: "#1e90ff",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Editar
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 🔹 Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              backgroundColor: darkMode ? "#222" : "#fff",
              padding: 20,
              borderRadius: 8,
              width: 350,
              boxShadow: "0 0 10px rgba(0,0,0,0.3)",
            }}
          >
            <h3 style={{ marginBottom: 15, color: darkMode ? "#fff" : "#222" }}>
              {form.id ? "Editar Usuario" : "Agregar Usuario"}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                type="text"
                placeholder="Nombre"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
                required
              />
              <input
                type="text"
                placeholder="Apellido"
                value={form.apellido}
                onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
                required
              />
              <input
                type="text"
                placeholder="Teléfono"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
              />
              <input
                type="date"
                placeholder="Fecha de nacimiento"
                value={form.fecha_nacimiento}
                onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })}
                style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
              />
              <select
                value={form.genero}
                onChange={(e) => setForm({ ...form, genero: e.target.value })}
                style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
              >
                <option value="">Selecciona género</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
              <input
                type="password"
                placeholder="Contraseña"
                value={form.password || ""}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
                required={!form.id} // obligatorio solo si es nuevo usuario
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: "8px 12px", borderRadius: 6, border: "none", backgroundColor: "#ccc", cursor: "pointer" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 12px", borderRadius: 6, border: "none", backgroundColor: "#960b2b", color: "#fff", cursor: "pointer" }}
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
