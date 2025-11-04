import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

const ssl = env.SSL_REQUIRED ? { rejectUnauthorized: false } : false;

const poolConfig = env.DATABASE_URL
  ? {
      connectionString: env.DATABASE_URL,
      ssl,
      max: 20,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 2_000,
      keepAlive: true,
    }
  : {
      host: env.PG_HOST,
      port: env.PG_PORT,
      user: env.PG_USER,
      password: env.PG_PASSWORD,
      database: env.PG_DATABASE,
      ssl,
      max: 20,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 2_000,
      keepAlive: true,
    };

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('[PG] Pool error:', err);
});

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
