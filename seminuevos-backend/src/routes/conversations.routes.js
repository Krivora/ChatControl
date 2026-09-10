// src/routes/conversations.routes.js
import { Router } from "express";
import { list, getFull } from "../controllers/conversations.controller.js";
import { requireAuth } from "../middlewares/auth.js";

const r = Router();

// Estos endpoints exponen conversaciones completas con datos personales del
// cliente: no pueden quedar abiertos.
r.use(requireAuth);

// lista de conversaciones con último mensaje
r.get("/", list);

// detalle completo
r.get("/:id/full", getFull);

export default r;
