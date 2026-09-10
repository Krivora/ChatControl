// src/config/env.js
//
// Punto único de lectura de process.env. Ningún otro módulo debe tocar
// process.env directamente: así el arranque falla rápido y en un solo sitio
// cuando falta configuración, en vez de reventar a mitad de una petición.
import 'dotenv/config';

const toBool = (v, fallback = false) => {
  if (v === undefined || v === null || v === '') return fallback;
  return ['1', 'true', 'on', 'enable', 'enabled', 'require'].includes(
    String(v).trim().toLowerCase()
  );
};

const toInt = (v, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const toList = (v) =>
  String(v || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

export const env = {
  NODE_ENV,
  isProd,
  PORT: toInt(process.env.PORT, 4000),

  // Orígenes que pueden llamar a la API desde un navegador.
  // Vacío en desarrollo = se permite cualquiera; en producción es obligatorio.
  CORS_ORIGINS: toList(process.env.CORS_ORIGINS),

  // Opción 1: cadena completa. Ej: postgres://user:pass@host:port/db
  DATABASE_URL: process.env.DATABASE_URL || '',

  // Opción 2: campos sueltos
  PG_USER: process.env.PG_USER,
  PG_PASSWORD: process.env.PG_PASSWORD,
  PG_HOST: process.env.PG_HOST,
  PG_PORT: toInt(process.env.PG_PORT, 5432),
  PG_DATABASE: process.env.PG_DATABASE,
  PG_SSL: process.env.PG_SSL,
  SSL_REQUIRED: toBool(process.env.PG_SSL),

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',

  WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
  WHATSAPP_API_VERSION: process.env.WHATSAPP_API_VERSION || 'v22.0',

  DEFAULT_PAGE_SIZE: toInt(process.env.DEFAULT_PAGE_SIZE, 20),
  MAX_PAGE_SIZE: toInt(process.env.MAX_PAGE_SIZE, 100),

  // El job de seguimiento manda WhatsApps reales. Con más de una réplica hay
  // que dejarlo activo en una sola, o el cliente recibe el mismo aviso N veces.
  FOLLOWUP_ENABLED: toBool(process.env.FOLLOWUP_ENABLED, true),
  FOLLOWUP_INTERVAL_MS: toInt(process.env.FOLLOWUP_INTERVAL_MS, 60_000),
  FOLLOWUP_AFTER_HOURS: toInt(process.env.FOLLOWUP_AFTER_HOURS, 23),
};

/**
 * Valida la configuración antes de levantar el servidor.
 * Preferimos caer en el arranque (visible en el deploy) a caer en el primer
 * login de un usuario real.
 */
export function assertEnv() {
  const errors = [];
  const warnings = [];

  if (!env.JWT_SECRET) {
    errors.push('JWT_SECRET es obligatorio: sin él la firma de tokens falla en el primer login.');
  } else if (env.isProd && env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET debe tener al menos 32 caracteres en producción.');
  }

  const hasPgFields = env.PG_HOST && env.PG_USER && env.PG_DATABASE;
  if (!env.DATABASE_URL && !hasPgFields) {
    errors.push('Falta configuración de base de datos: define DATABASE_URL o PG_HOST/PG_USER/PG_DATABASE.');
  }

  if (env.isProd && env.CORS_ORIGINS.length === 0) {
    errors.push('CORS_ORIGINS es obligatorio en producción: no se permite abrir la API a cualquier origen.');
  }

  if (!env.WHATSAPP_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID) {
    warnings.push('WhatsApp sin configurar: el envío de mensajes y el job de seguimiento quedarán inactivos.');
  }

  for (const w of warnings) console.warn(`[env] Aviso: ${w}`);

  if (errors.length) {
    console.error('[env] Configuración inválida:');
    for (const e of errors) console.error(`  - ${e}`);
    console.error('[env] Revisa .env.example para la plantilla completa.');
    throw new Error('Configuración de entorno inválida');
  }
}
