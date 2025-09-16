// src/config/env.js
import 'dotenv/config';

const toBool = (v) => {
  if (v === undefined || v === null) return false;
  return ['1', 'true', 'TRUE', 'on', 'enable', 'enabled', 'require'].includes(String(v).trim());
};

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 4000),

  // Opción 1: cadena completa (opcional). Ej: postgres://user:pass@host:port/db
  DATABASE_URL: process.env.DATABASE_URL || '',

  // Opción 2: campos sueltos (como los que compartiste)
  PG_USER: process.env.PG_USER,
  PG_PASSWORD: process.env.PG_PASSWORD,
  PG_HOST: process.env.PG_HOST,
  PG_PORT: Number(process.env.PG_PORT || 5432),
  PG_DATABASE: process.env.PG_DATABASE,

  // SSL: con DO suele ser "require"
  PG_SSL: process.env.PG_SSL,          // p.ej. "require"
  SSL_REQUIRED: toBool(process.env.PG_SSL), // true si "require"/"true"/"1"/etc.
};
