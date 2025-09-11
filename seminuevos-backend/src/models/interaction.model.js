const pool = require("../config/db");

const getInteractions = async () => {
  const result = await pool.query("SELECT * FROM interacciones");
  return result.rows;
};

module.exports = { getInteractions };
