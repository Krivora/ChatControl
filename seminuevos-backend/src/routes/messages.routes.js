import express from "express";
import { createMessage, listMessagesByConversation } from "../controllers/messages.controller.js";

const router = express.Router();

router.post("/", createMessage);
router.get("/", listMessagesByConversation); // ✅ Esta línea permite GET /messages?conversation_id=2

export default router;
