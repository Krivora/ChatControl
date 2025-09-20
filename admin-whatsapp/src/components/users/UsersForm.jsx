import React, { useState, useEffect } from "react";

export default function UserForm({ darkMode, user, onClose, onSave }) {
  const [form, setForm] = useState({ id: null, nombre: "", apellido: "", email: "", telefono: "", fecha_nacimiento: "", genero: "", password: "" });

  useEffect(() => { if (user) setForm({ ...user, password: "" }); }, [user]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = e => { e.preventDefault(); onSave(form); };

  return (
    <div style={{ position: "fixed", top:0,left:0,width:"100%",height:"100%",backgroundColor:"rgba(0,0,0,0.5)", display:"flex", justifyContent:"center", alignItems:"center", zIndex:999 }}>
      <div style={{ backgroundColor: darkMode ? "#222" : "#fff", padding: 20, borderRadius: 8, width: 350 }}>
        <h3 style={{ color: darkMode ? "#fff" : "#222", marginBottom: 15 }}>{form.id ? "Editar Usuario" : "Agregar Usuario"}</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection:"column", gap:10 }}>
          <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }} />
          <input name="apellido" placeholder="Apellido" value={form.apellido} onChange={handleChange} required style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }} />
          <input name="email" placeholder="Email" type="email" value={form.email} onChange={handleChange} required style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }} />
          <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }} />
          <input name="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={handleChange} style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }} />
          <select name="genero" value={form.genero} onChange={handleChange} style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}>
            <option value="">Selecciona género</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
          </select>
          <input name="password" type="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required={!form.id} style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }} />

          <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
            <button type="button" onClick={onClose} style={{ padding:"8px 12px", borderRadius:6, border:"none", backgroundColor:"#ccc", cursor:"pointer" }}>Cancelar</button>
            <button type="submit" style={{ padding:"8px 12px", borderRadius:6, border:"none", backgroundColor:"#960b2b", color:"#fff", cursor:"pointer" }}>Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
