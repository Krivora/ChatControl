const UserModel = require("../models/user.model");

// GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.getUsers();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo usuarios" });
  }
};

// POST /api/users
  const createUser = async (req, res) => {
    try {
      const { nombre, apellido, email, telefono, fecha_nacimiento, genero, password } = req.body;
      const newUser = await UserModel.createUser({ nombre, apellido, email, telefono, fecha_nacimiento, genero, password });
      res.json(newUser);
    } catch (error) {
      console.error(error);

      // 🔹 Si es duplicado (constraint de email)
      if (error.code === "23505") {
        return res.status(400).json({ message: "El correo ya está registrado" });
      }

      res.status(500).json({ message: "Error creando usuario" });
    }
  };


module.exports = { getAllUsers, createUser };
