// src/routes/conversations.routes.js
import { Router } from "express";
import { list, getFull } from "../controllers/conversations.controller.js";

const r = Router();

// lista de conversaciones con último mensaje
r.get("/", list);

// detalle completo
r.get("/:id/full", getFull);

export default r;
