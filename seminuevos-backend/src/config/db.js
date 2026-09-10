// src/config/db.js
//
// Pool único de PostgreSQL. Es el ÚNICO módulo que crea conexiones:
// los repositorios lo consumen, y nadie más aguas arriba (ni controllers,
// ni jobs, ni server.js) debe importarlo para lanzar SQL suelto.
import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

// SSL de proveedores gestionados (DigitalOcean, Render, Neon…)
const ssl = env.SSL_REQUIRED ? { rejectUnauthorized: false } : false;

const basePoolConfig = {
  max: 20,
  idleTimeoutMillis: 30_000,
  // El handshake TLS contra una base remota puede pasar de 2s con facilidad.
  connectionTimeoutMillis: 10_000,
  keepAlive: true,
  ssl,
};

export const poolConfig = env.DATABASE_URL
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

// `pg` ya reemplaza por su cuenta los clientes que fallan; el pool sigue
// siendo utilizable. Solo hay que registrar el error para no perderlo.
pool.on('error', (err) => {
  console.error('[PG] Error en cliente inactivo:', err.message);
});

/**
 * Comprueba que la base responde. Se llama explícitamente desde el arranque
 * para que un fallo de conexión sea visible antes de aceptar tráfico.
 */
export async function verifyConnection() {
  await pool.query('SELECT 1');
  if (env.NODE_ENV !== 'test') console.log('[PG] Conexión OK');
}

/**
 * Cierra el pool. Lo usa el apagado ordenado de server.js para que las
 * consultas en vuelo terminen antes de que el proceso muera.
 */
export async function closePool() {
  await pool.end();
  console.log('[PG] Pool cerrado');
}
