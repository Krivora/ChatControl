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
    res.status(500).json({ message: "Error creando usuario" });
  }
};

// PUT /api/users/:id
const editUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, telefono, fecha_nacimiento, genero, password } = req.body;

    const updatedUser = await UserModel.updateUser(id, { nombre, apellido, email, telefono, fecha_nacimiento, genero, password });

    if (!updatedUser) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error actualizando usuario" });
  }
};

module.exports = { getAllUsers, createUser, editUser };
