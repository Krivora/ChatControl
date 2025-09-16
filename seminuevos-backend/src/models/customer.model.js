const pool = require("../config/db");

const getCustomers = async () => {
  const result = await pool.query("SELECT * FROM customers");
  return result.rows;
};

module.exports = { getCustomers };
