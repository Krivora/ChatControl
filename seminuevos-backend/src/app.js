import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev')); // o logger.js si prefieres

// Healthcheck
app.get('/health', (req, res) => res.json({ ok: true }));

// Rutas principales
app.use('/api', routes);

// Middlewares finales
app.use(notFound);
app.use(errorHandler);

export default app;
