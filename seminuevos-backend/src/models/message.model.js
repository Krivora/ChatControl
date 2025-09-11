const pool = require("../config/db");

const getMessages = async () => {
  const result = await pool.query("SELECT * FROM mensajes_bot");
  return result.rows;
};

module.exports = { getMessages };
