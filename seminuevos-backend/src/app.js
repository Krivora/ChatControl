import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';
import messagesRoutes from './routes/messages.routes.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Healthcheck
app.get('/health', (req, res) => res.json({ ok: true }));

// Rutas principales
app.use('/api', routes);

// Rutas de mensajes
app.use('/api/messages', messagesRoutes); // <— asegúrate que esté **antes** de los middlewares de error

// Middlewares finales
app.use(notFound);
app.use(errorHandler);

export default app;
