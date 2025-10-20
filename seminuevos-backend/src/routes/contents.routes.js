import express from "express";
import {
  listContents,
  getContent,
  updateContent,
} from "../controllers/contents.controller.js";

const router = express.Router();

router.get("/", listContents);        // Listar todos
router.get("/:id", getContent);       // Obtener uno
router.put("/:id", updateContent);    // Actualizar

export default router;
