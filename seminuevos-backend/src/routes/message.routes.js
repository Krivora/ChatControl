const express = require("express");
const router = express.Router();
const { getMessagesByConversation, getAnswersByConversation } = require("../controllers/message.controller");

// Mensajes por conversación
router.get("/conversation/:id", getMessagesByConversation);

// Respuestas por conversación
router.get("/answers/:id", getAnswersByConversation);

module.exports = router;
