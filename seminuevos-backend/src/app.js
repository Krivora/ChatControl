// src/app.js
//
// Sólo el ensamblado de la aplicación HTTP: middlewares, rutas y manejo de
// errores. Ningún efecto secundario de arranque (base de datos, sockets,
// jobs) vive aquí — de eso se ocupa server.js. Así este módulo se puede
// importar en un test sin levantar infraestructura.
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import { env } from './config/env.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Detrás de Nginx o del balanceador del proveedor: necesario para que el
// rate limiting y los logs vean la IP real del cliente y no la del proxy.
app.set('trust proxy', 1);

app.use(helmet());
app.use(compression());

// Lista blanca de orígenes. Antes era `cors()` sin argumentos, es decir
// cualquier sitio web podía llamar a la API con la sesión del navegador.
app.use(
  cors({
    origin(origin, callback) {
      // Sin cabecera Origin: peticiones servidor a servidor, curl, healthchecks.
      if (!origin) return callback(null, true);
      if (env.CORS_ORIGINS.length === 0 && !env.isProd) return callback(null, true);
      if (env.CORS_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.isProd ? 'combined' : 'dev'));

// Healthcheck: fuera de /api y sin autenticación, lo consulta el orquestador.
app.get('/health', (_req, res) => res.json({ ok: true, uptime: process.uptime() }));

// Un único punto de montaje. Antes /api/messages y /api/whatsapp se montaban
// dos veces (aquí y dentro de routes/index.js), lo que dejaba un árbol de
// rutas duplicado y fácil de desincronizar al añadir middlewares.
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
