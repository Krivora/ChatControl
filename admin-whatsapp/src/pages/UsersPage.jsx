import React, { useState, useEffect } from "react";
import UserForm from "../components/users/UsersForm.jsx";
import UserList from "../components/users/UsersList.jsx";

export default function UsersPage({ darkMode }) {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!res.ok) {
        console.error("Error al obtener usuarios:", res.statusText);
        return;
      }

      const data = await res.json();
      console.log("Respuesta API completa:", data);

      // Solo usamos el array de usuarios que está dentro de data.data
      const usersArray = Array.isArray(data.data) ? data.data : [];
      console.log("Usuarios válidos:", usersArray);

      setUsers(usersArray);
    } catch (err) {
      console.error("Error al hacer fetch de usuarios:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleSave = async (form) => {
    try {
      const url = form.id
        ? `${import.meta.env.VITE_API_BASE_URL}/users/${form.id}`
        : `${import.meta.env.VITE_API_BASE_URL}/users`;
      const method = form.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        return alert(data.message || "Error al guardar usuario");
      }

      setShowModal(false);
      fetchUsers();
    } catch (err) {
      console.error("Error creando/actualizando usuario:", err);
      alert("Error creando/actualizando usuario");
    }
  };

  return (
    <div style={{ padding: 20, backgroundColor: darkMode ? "#222" : "#f4f4f4", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 style={{ color: darkMode ? "#fff" : "#222" }}>Usuarios</h2>
        <button
          onClick={handleAdd}
          style={{ padding: "8px 15px", borderRadius: 6, border: "none", backgroundColor: "#960b2b", color: "#fff", cursor: "pointer" }}
        >
          + Agregar Usuario
        </button>
      </div>

      <UserList users={users} darkMode={darkMode} onEdit={handleEdit} />

      {showModal && (
        <UserForm darkMode={darkMode} user={editingUser} onClose={() => setShowModal(false)} onSave={handleSave} />
      )}
    </div>
  );
}
