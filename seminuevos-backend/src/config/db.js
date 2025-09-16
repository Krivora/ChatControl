// src/config/db.js
import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

// En DO normalmente basta con rejectUnauthorized:false cuando PG_SSL=require
const ssl =
  env.SSL_REQUIRED
    ? { rejectUnauthorized: false } // Usa true + CA si tienes el certificado
    : false;

const basePoolConfig = {
  max: 20,                    // conexiones simultáneas
  idleTimeoutMillis: 30_000,  // cierra conexiones ociosas
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

export const pool = new Pool(poolConfig);

// Logs útiles
pool.on('error', (err) => {
  console.error('[PG] Pool error:', err);
});

// Ping rápido para detectar problemas al arrancar
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

// Cierre limpio al terminar el proceso
const shutdown = async (signal) => {
  try {
    await pool.end();
    console.log('[PG] Pool cerrado por', signal);
  } catch (e) {
    console.error('[PG] Error cerrando pool:', e.message);
  } finally {
    process.exit(0);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
