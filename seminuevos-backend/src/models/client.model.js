const pool = require("../config/db");

const getClients = async () => {
  const result = await pool.query(`
    SELECT 
      c.*, 
      co.id AS conversation_id,
      co.status AS conversation_status
    FROM customers c
    LEFT JOIN conversations co 
      ON co.customer_id = c.id 
      AND co.status IN ('active', 'finish')
  `);
  return result.rows;
};

module.exports = { getClients };
