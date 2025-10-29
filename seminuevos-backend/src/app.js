import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";
import messagesRoutes from "./routes/messages.routes.js";
import whatsappRoutes from "./routes/whatsapp.routes.js";

// 👇 Importamos el job de recordatorio (se ejecuta en segundo plano)
import "./jobs/whatsappAutoFollowup.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// ✅ Healthcheck
app.get("/health", (req, res) => res.json({ ok: true }));

// ✅ Rutas principales
app.use("/api", routes);

// ✅ Rutas de mensajes
app.use("/api/messages", messagesRoutes);

// ✅ Rutas de WhatsApp
app.use("/api/whatsapp", whatsappRoutes);

// ⚠️ Middlewares finales
app.use(notFound);
app.use(errorHandler);

export default app;
