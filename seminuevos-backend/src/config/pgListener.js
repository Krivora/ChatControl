// src/config/pgListener.js
//
// Puente entre el canal LISTEN/NOTIFY de PostgreSQL y Socket.IO.
//
// El emisor (`io`) se recibe por parámetro en vez de importarse desde
// server.js: esa importación creaba el ciclo pgListener → server → db → …
// y ataba este módulo al arranque del proceso.
import { pool } from './db.js';

const CHANNEL = 'new_message';
const RECONNECT_DELAY_MS = 5_000;

/**
 * Suscribe el proceso al canal `new_message` y reenvía cada notificación
 * a la sala de la conversación correspondiente.
 *
 * La conexión es dedicada (no vuelve al pool): un cliente en LISTEN no puede
 * reutilizarse para consultas. Si se cae, se reintenta sola — antes el
 * tiempo real se quedaba mudo en silencio hasta reiniciar el servidor.
 *
 * @param {import('socket.io').Server} io
 * @returns {{ stop: () => Promise<void> }}
 */
export function startPostgresListener(io) {
  let client = null;
  let timer = null;
  let stopped = false;

  const scheduleReconnect = () => {
    if (stopped || timer) return;
    timer = setTimeout(() => {
      timer = null;
      connect();
    }, RECONNECT_DELAY_MS);
  };

  const handleNotification = (msg) => {
    if (msg.channel !== CHANNEL) return;
    try {
      const payload = JSON.parse(msg.payload);
      io.to(`conversation_${payload.conversation_id}`).emit('message_created', payload);
    } catch (err) {
      console.error('[PG-Listener] Payload inválido en', CHANNEL, '-', err.message);
    }
  };

  async function connect() {
    if (stopped) return;
    try {
      client = await pool.connect();

      client.on('notification', handleNotification);
      client.on('error', (err) => {
        console.error('[PG-Listener] Conexión perdida:', err.message);
        try { client.release(true); } catch { /* ya liberado */ }
        client = null;
        scheduleReconnect();
      });

      await client.query(`LISTEN ${CHANNEL}`);
      console.log(`[PG-Listener] Escuchando el canal "${CHANNEL}"`);
    } catch (err) {
      console.error('[PG-Listener] No se pudo suscribir:', err.message, `- reintento en ${RECONNECT_DELAY_MS / 1000}s`);
      client = null;
      scheduleReconnect();
    }
  }

  connect();

  return {
    async stop() {
      stopped = true;
      if (timer) { clearTimeout(timer); timer = null; }
      if (client) {
        try {
          await client.query(`UNLISTEN ${CHANNEL}`);
          client.release();
        } catch { /* la conexión ya estaba caída */ }
        client = null;
      }
      console.log('[PG-Listener] Detenido');
    },
  };
}
