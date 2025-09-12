const pool = require("../config/db");
const bcrypt = require("bcryptjs");

// Traer todos los usuarios
const getUsers = async () => {
  const result = await pool.query("SELECT * FROM users ORDER BY id ASC");
  return result.rows;
};

// Crear usuario
const createUser = async ({ nombre, apellido, email, telefono, fecha_nacimiento, genero, password }) => {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const result = await pool.query(
    `INSERT INTO users (nombre, apellido, email, telefono, fecha_nacimiento, genero, password)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [nombre, apellido, email, telefono, fecha_nacimiento, genero, hashedPassword]
  );
  return result.rows[0];
};

// Editar usuario
const updateUser = async (id, { nombre, apellido, email, telefono, fecha_nacimiento, genero, password }) => {
  let query = `
    UPDATE users SET nombre=$1, apellido=$2, email=$3, telefono=$4, fecha_nacimiento=$5, genero=$6
  `;
  const params = [nombre, apellido, email, telefono, fecha_nacimiento, genero];

  if (password) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    query += `, password=$7 WHERE id=$8 RETURNING *`;
    params.push(hashedPassword, id);
  } else {
    query += ` WHERE id=$7 RETURNING *`;
    params.push(id);
  }

  const result = await pool.query(query, params);
  return result.rows[0];
};

module.exports = { getUsers, createUser, updateUser };
