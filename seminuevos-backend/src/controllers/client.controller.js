const ClientModel = require("../models/client.model");

const getAllClients = async (req, res) => {
  try {
    const clients = await ClientModel.getClients();
    res.json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al tratar de obtener los clientes" });
  }
};

const getClientMessages = async (req, res) => {
  const clientId = req.params.id;
  try {
    const result = await ClientModel.getClientMessages(clientId);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener mensajes del cliente" });
  }
};

module.exports = { getAllClients, getClientMessages };