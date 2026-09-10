// src/server.js
//
// Composition root: es el único sitio que conoce a la vez la app HTTP, la
// base de datos, los sockets y los jobs. Valida la configuración, arranca
// cada pieza en orden y las apaga en orden inverso.
import http from 'http';
import { Server } from 'socket.io';

import app from './app.js';
import { env, assertEnv } from './config/env.js';
import { verifyConnection, closePool } from './config/db.js';
import { startPostgresListener } from './config/pgListener.js';
import { startFollowupJob } from './jobs/whatsappAutoFollowup.js';
import { verifyToken } from './utils/jwt.js';

assertEnv();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: env.CORS_ORIGINS.length > 0 ? env.CORS_ORIGINS : true,
    credentials: true,
  },
});

// Los sockets transportan las conversaciones de los clientes: exigen el mismo
// token que la API REST. Antes cualquiera podía conectarse y unirse a la sala
// de cualquier conversación.
io.use((socket, next) => {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers?.authorization?.replace(/^Bearer /, '');

  if (!token) return next(new Error('No autorizado: token faltante'));

  try {
    socket.data.user = verifyToken(token);
    next();
  } catch {
    next(new Error('No autorizado: token inválido o expirado'));
  }
});

io.on('connection', (socket) => {
  const who = socket.data.user?.email || socket.id;
  if (!env.isProd) console.log(`🟢 Cliente conectado: ${who}`);

  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
  });

  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
  });

  socket.on('disconnect', () => {
    if (!env.isProd) console.log(`🔴 Cliente desconectado: ${who}`);
  });
});

let listener = null;
let followupJob = null;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ El puerto ${env.PORT} ya está en uso. Cambia PORT o detén el proceso que lo ocupa.`);
    process.exit(1);
  }
  throw err;
});

async function start() {
  await verifyConnection();

  listener = startPostgresListener(io);
  followupJob = startFollowupJob();

  server.listen(env.PORT, () => {
    console.log(`✅ Servidor escuchando en http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });
}

/**
 * Apagado ordenado: se deja de aceptar conexiones nuevas, se cierran los
 * consumidores y al final el pool, para que las consultas en vuelo terminen.
 * El pool ya no se puede cerrar accidentalmente desde otro módulo.
 */
let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`\n⏹️  ${signal} recibido, cerrando…`);

  // Si algo se queda colgado, no dejamos el proceso zombi indefinidamente.
  const forceExit = setTimeout(() => {
    console.error('⚠️  Cierre forzado tras 10s');
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  try {
    followupJob?.stop();
    await listener?.stop();
    io.close();
    await new Promise((resolve) => server.close(resolve));
    await closePool();
    console.log('👋 Cierre completo');
    process.exit(0);
  } catch (err) {
    console.error('Error durante el cierre:', err.message);
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});

start().catch((err) => {
  console.error('❌ No se pudo arrancar el servidor:', err.message);
  process.exit(1);
});

export { io, server };
