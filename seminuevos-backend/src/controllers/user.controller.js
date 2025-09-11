const UserModel = require("../models/user.model");

const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.getUsers();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo usuarios" });
  }
};

module.exports = { getAllUsers };
