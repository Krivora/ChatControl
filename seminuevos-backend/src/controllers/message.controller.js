const MessageModel = require("../models/message.model");

const getAllMessages = async (req, res) => {
  try {
    const messages = await MessageModel.getMessages();
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al tratar de obtener los mensajes" });
  }
};

module.exports = { getAllMessages };
