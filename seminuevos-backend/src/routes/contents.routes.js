// src/routes/contents.routes.js
import { Router } from "express";
import {
  listContents,
  getContent,
  updateContent,
} from "../controllers/contents.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";

const r = Router();

r.use(requireAuth);

// Consulta: cualquier usuario autenticado.
r.get("/", listContents);
r.get("/:id", getContent);

// Edición: los contenidos son los textos que el bot manda al cliente final,
// así que cambiarlos queda restringido a administración.
r.put("/:id", authorizeRole("admin", "super_admin"), updateContent);

export default r;
