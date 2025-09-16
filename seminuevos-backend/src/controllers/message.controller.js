const pool = require("../config/db");

// Traer todos los mensajes de una conversación
const getMessagesByConversation = async (req, res) => {
  const conversationId = parseInt(req.params.id);
  if (isNaN(conversationId)) {
    return res.status(400).json({ message: "ID de conversación inválido" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC",
      [conversationId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener mensajes" });
  }
};

// Traer las respuestas ya convertidas de una conversación
const getAnswersByConversation = async (req, res) => {
  const conversationId = parseInt(req.params.id);
  if (isNaN(conversationId)) {
    return res.status(400).json({ message: "ID de conversación inválido" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM answers WHERE conversation_id = $1 ORDER BY created_at ASC",
      [conversationId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener respuestas" });
  }
};

module.exports = { getMessagesByConversation, getAnswersByConversation };
