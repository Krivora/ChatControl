const pool = require("../config/db");

const getMessagesByConversation = async (conversationId) => {
  if (!conversationId) return []; // evita pasar undefined
  const result = await pool.query(
    "SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC",
    [conversationId]
  );
  return result.rows;
};

module.exports = { getMessagesByConversation };
