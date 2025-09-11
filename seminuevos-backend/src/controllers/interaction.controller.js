const InteractionModel = require("../models/interaction.model");

const getAllInteractions = async (req, res) => {
  try {
    const interaction = await InteractionModel.getInteractions();
    res.json(interaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al tratar de obtener las interacciones" });
  }
};
module.exports = { getAllInteractions };
