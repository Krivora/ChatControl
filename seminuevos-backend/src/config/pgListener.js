// src/config/pgListener.js
import { pool } from "./db.js";
import { io } from "../server.js";

/**
 * Escucha el canal "new_message" de PostgreSQL.
 * Cuando detecta un INSERT en la tabla messages (por el trigger),
 * emite un evento Socket.IO a todos los clientes en la conversación correspondiente.
 */
export async function startPostgresListener() {
  try {
    const client = await pool.connect();

    client.on("notification", (msg) => {
      try {
        const payload = JSON.parse(msg.payload);
        console.log("📩 Nuevo mensaje detectado:", payload);

        // 🔊 Emitir evento en tiempo real a la sala de esa conversación
        io.to(`conversation_${payload.conversation_id}`).emit("message_created", payload);
      } catch (error) {
        console.error("❌ Error parseando payload de NOTIFY:", error);
      }
    });

    // Escucha el canal definido en el trigger
    await client.query("LISTEN new_message");

    console.log("👂 PostgreSQL escuchando en canal 'new_message'");
  } catch (error) {
    console.error("❌ Error iniciando el listener de PostgreSQL:", error);
  }
}
