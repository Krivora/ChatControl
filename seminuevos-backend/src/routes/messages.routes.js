// src/routes/messages.routes.js
import { Router } from "express";
import { createMessage, listMessagesByConversation } from "../controllers/messages.controller.js";
import { requireAuth } from "../middlewares/auth.js";

const r = Router();

// El historial de mensajes es información del cliente y el alta permite
// inyectar mensajes en una conversación: ambos requieren sesión.
r.use(requireAuth);

// POST /api/messages
r.post("/", createMessage);

// GET /api/messages?conversation_id=2
r.get("/", listMessagesByConversation);

export default r;
