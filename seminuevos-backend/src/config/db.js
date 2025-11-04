// src/config/db.js
import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

// Config SSL (DigitalOcean, Render, etc.)
const ssl = env.SSL_REQUIRED ? { rejectUnauthorized: false } : false;

const basePoolConfig = {
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,
  keepAlive: true,
  ssl,
};

const poolConfig = env.DATABASE_URL
  ? { ...basePoolConfig, connectionString: env.DATABASE_URL }
  : {
      ...basePoolConfig,
      host: env.PG_HOST,
      port: env.PG_PORT,
      user: env.PG_USER,
      password: env.PG_PASSWORD,
      database: env.PG_DATABASE,
    };

// 🔹 Instancia única del pool
export let pool = new Pool(poolConfig);

// 🔸 Log de errores
pool.on('error', (err) => {
  console.error('[PG] Pool error:', err.message);
});

// 🔸 Verificación inicial
(async () => {
  try {
    await pool.query('SELECT 1');
    if (process.env.NODE_ENV !== 'test') {
      console.log('[PG] Conexión OK');
    }
  } catch (err) {
    console.error('[PG] Error al conectar:', err.message);
  }
})();

// 🔹 Protección: evita cierres accidentales del pool
const originalEnd = pool.end.bind(pool);
pool.end = (...args) => {
  if (process.env.NODE_ENV !== 'test') {
    console.warn('[PG] pool.end() bloqueado en producción');
    return Promise.resolve();
  }
  return originalEnd(...args);
};

// 🔹 Auto-reconexión si el pool se cierra accidentalmente
import pgPackage from 'pg';
setInterval(async () => {
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    if (err.message.includes('Cannot use a pool after calling end')) {
      console.warn('[PG] Pool recreado automáticamente tras cierre');
      pool = new pgPackage.Pool(poolConfig);
    }
  }
}, 30_000);
