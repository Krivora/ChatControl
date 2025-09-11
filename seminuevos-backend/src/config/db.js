const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  ssl: process.env.PG_SSL === "require" ? { rejectUnauthorized: false } : false,
});
pool.connect()
  .then(client => {
    console.log("Conectado a la BD");
    client.release();
  })
  .catch(err => console.error("Error al conectar a la BD:", err.stack));


module.exports = pool;