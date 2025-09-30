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

  socket.on("join_conversation", (conversationId) => {
    socket.join(`conversation_${conversationId}`);
  });

  socket.on("leave_conversation", (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
  });

  socket.on("disconnect", () => {});
});

// 🧠 Escucha eventos desde Postgres (LISTEN/NOTIFY)
pool.connect((err, client) => {
  if (err) throw err;
  client.on("notification", async (msg) => {
    if (msg.channel === "new_message") {
      const payload = JSON.parse(msg.payload);
      // Emitimos solo al room de la conversación afectada
      io.to(`conversation_${payload.conversation_id}`).emit("message_created", payload);
    }
  });

  client.query("LISTEN new_message");
});

server.listen(env.PORT, () => {});
