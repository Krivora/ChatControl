const UserModel = require("../models/user.model");
const bcrypt = require("bcryptjs");

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Buscar usuario por email
    const users = await UserModel.getUsers();
    const user = users.find(u => u.email === email);

    if (!user) return res.status(400).json({ message: "Usuario no encontrado" });

    // Comparar contraseña
    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) return res.status(400).json({ message: "Contraseña incorrecta" });

    // Retornar datos del usuario sin la contraseña
    const { id, nombre, apellido, telefono, fecha_nacimiento, genero } = user;
    res.json({ id, nombre, apellido, email, telefono, fecha_nacimiento, genero });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error en login" });
  }
};

module.exports = { login };
