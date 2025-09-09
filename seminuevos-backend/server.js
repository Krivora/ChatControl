// server.js
import express from "express";
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";
import morgan from "morgan";

dotenv.config();
const app = express();

// 🔹 Middlewares
app.use(cors());
app.use(express.json());

// 🔹 Morgan para logging de peticiones
app.use(morgan("dev"));

// 🔹 Configuración de PostgreSQL usando tus variables de entorno correctas
const { Pool } = pg;
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  ssl: { rejectUnauthorized: false }, // Requerido por DigitalOcean
});

// 🔹 Endpoints
app.get("/clients", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, status FROM clients");
    console.log("Clientes obtenidos:", result.rows); // 🔹 Debug adicional
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener clientes:", err);
    res.status(500).json({ error: "Error al obtener clientes" });
  }
});

app.get("/clients/:id/ponderacion", async (req, res) => {
  const clientId = req.params.id;
  try {
    const result = await pool.query(
      "SELECT question, value FROM ponderacion WHERE client_id = $1",
      [clientId]
    );
    console.log(`Ponderación del cliente ${clientId}:`, result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener ponderación:", err);
    res.status(500).json({ error: "Error al obtener ponderación" });
  }
});

app.get("/clients/:id/messages", async (req, res) => {
  const clientId = req.params.id;
  try {
    const result = await pool.query(
      "SELECT id, message, sender, created_at FROM messages WHERE client_id = $1 ORDER BY created_at ASC",
      [clientId]
    );
    console.log(`Mensajes del cliente ${clientId}:`, result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener mensajes:", err);
    res.status(500).json({ error: "Error al obtener mensajes" });
  }
});

// 🔹 Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
