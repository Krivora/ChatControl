import express from "express";
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";
import morgan from "morgan";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const { Pool } = pg;
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  ssl: { rejectUnauthorized: false },
});

// Obtener todos los clientes
app.get("/clients", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nombre_completo, COALESCE(paso_actual, 0) AS paso_actual
      FROM perfiles_usuarios
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener clientes" });
  }
});

// Obtener mensajes de un cliente (solo preguntas que tienen respuesta)
app.get("/clients/:id/messages", async (req, res) => {
  const clientId = req.params.id;

  try {
    const clientResult = await pool.query(`
      SELECT *
      FROM perfiles_usuarios
      WHERE id = $1
    `, [clientId]);

    if (!clientResult.rows.length) return res.status(404).json({ error: "Cliente no encontrado" });

    const perfil = clientResult.rows[0];

    const botResult = await pool.query(`
      SELECT id, clave, mensaje, fecha_creacion
      FROM mensajes_bot
      WHERE activo = true
      ORDER BY fecha_creacion ASC
    `);

    const messages = [];

    botResult.rows.forEach(botMsg => {
      let respuesta = null;

      // Mapear solo las claves que existen en perfil
      const clavesMap = {
        pregunta_nombre: perfil.nombre_completo,
        pregunta_tipo_compra: perfil.tipo_compra,
        pregunta_tipo_auto: perfil.tipo_auto,
        pregunta_presupuesto_maximo: perfil.presupuesto_maximo?.toString(),
        pregunta_pago_inicial: perfil.pago_inicial?.toString(),
        pregunta_cuota_mensual: perfil.cuota_mensual_maxima?.toString(),
        pregunta_buro_credito: perfil.historial_crediticio,
        // si agregas columnas para estas, ponerlas aquí
        pregunta_tiempo_estreno: perfil.tiempo_estreno,
        pregunta_marca_modelo: perfil.marca_modelo
      };

      respuesta = clavesMap[botMsg.clave] ?? null;

      // Solo agregar si hay respuesta
      if (respuesta !== null && respuesta !== "") {
        messages.push({
          text: botMsg.mensaje,
          sender: "advisor",
          created_at: botMsg.fecha_creacion
        });

        const createdAt = new Date(new Date(botMsg.fecha_creacion).getTime() + 60000);
        messages.push({
          text: respuesta,
          sender: "client",
          created_at: createdAt.toISOString()
        });
      }
    });

    // Orden cronológico (por si acaso)
    messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    res.json(messages);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener mensajes" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
