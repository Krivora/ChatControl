// src/routes/whatsapp.routes.js
import { Router } from "express";
import { sendMessage } from "../controllers/whatsapp.controller.js";
import { requireAuth } from "../middlewares/auth.js";

const r = Router();

// Este endpoint envía mensajes reales desde el número de la empresa y consume
// cuota de la Cloud API. Sin autenticación era un relay abierto a internet.
r.post("/send", requireAuth, sendMessage);

export default r;
