const ClientModel = require("../models/client.model");

// Traer todos los clientes con su conversación activa
const getAllClients = async (req, res) => {
  try {
    const clients = await ClientModel.getClients();
    res.json(clients);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ message: "Error al obtener clientes" });
  }
};

module.exports = { getAllClients };
