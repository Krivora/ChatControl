// src/server.js
import http from "http";
import { Server } from "socket.io";
import { pool } from "./config/db.js";
import app from "./app.js";
import { env } from "./config/env.js";

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// 🔌 Escucha conexiones
io.on("connection", (socket) => {
  console.log(`🟢 Cliente conectado: ${socket.id}`);

  socket.on("join_conversation", (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`👋 Cliente ${socket.id} unido a conversación ${conversationId}`);
  });

  socket.on("leave_conversation", (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
    console.log(`👋 Cliente ${socket.id} salió de conversación ${conversationId}`);
  });

  socket.on("disconnect", () => {
    console.log(`🔴 Cliente desconectado: ${socket.id}`);
  });
});

// 🧠 Escucha eventos desde Postgres (LISTEN/NOTIFY)
pool.connect((err, client) => {
  if (err) throw err;

  console.log("🧩 Conectado a PostgreSQL, escuchando canal 'new_message'...");

  client.on("notification", async (msg) => {
    if (msg.channel === "new_message") {
      const payload = JSON.parse(msg.payload);
      console.log("📩 Nuevo mensaje detectado desde Postgres:", payload);

      // Emitimos solo al room de la conversación afectada
      io.to(`conversation_${payload.conversation_id}`).emit("message_created", payload);
      console.log(`📤 Emitido a room: conversation_${payload.conversation_id}`);
    }
  });

  client.query("LISTEN new_message");
});

server.listen(env.PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${env.PORT}`);
});
