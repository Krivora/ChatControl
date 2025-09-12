const pool = require("../config/db");
const bcrypt = require("bcryptjs"); // ← usar bcryptjs

// Traer todos los usuarios
const getUsers = async () => {
  const result = await pool.query("SELECT * FROM users ORDER BY id ASC");
  return result.rows;
};

// Crear usuario
const createUser = async ({ nombre, apellido, email, telefono, fecha_nacimiento, genero, password }) => {
  const hashedPassword = bcrypt.hashSync(password, 10); // ← hash sincrónico
  const result = await pool.query(
    `INSERT INTO users (nombre, apellido, email, telefono, fecha_nacimiento, genero, password)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [nombre, apellido, email, telefono, fecha_nacimiento, genero, hashedPassword]
  );
  return result.rows[0];
};

module.exports = { getUsers, createUser };
