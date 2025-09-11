const pool = require("../config/db");

const getClients = async () => {
  const result = await pool.query("SELECT * FROM perfiles_usuarios");
  return result.rows;
};


const getClientMessages = async (clientId) => {
  const result = await pool.query(
    "SELECT * FROM interacciones WHERE perfil_id = $1 ORDER BY created_at ASC",
    [clientId]
  );
  return result.rows;
};

module.exports = { getClients, getClientMessages };