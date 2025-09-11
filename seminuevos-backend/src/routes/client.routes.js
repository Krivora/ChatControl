const express = require("express");
const router = express.Router();
const { getAllClients, getClientMessages} = require("../controllers/client.controller");

router.get("/", getAllClients);
router.get("/:id/messages", getClientMessages);

module.exports = router;
