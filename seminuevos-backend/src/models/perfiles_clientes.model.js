const pool = require("../config/db");

const getUsers = async () => {
  const result = await pool.query("SELECT * FROM perfiles_usuarios");
  return result.rows;
};

module.exports = { getClientes };
