const express = require("express");
const router = express.Router();
const { getAllClients } = require("../controllers/client.controller");

// Ruta GET para traer todos los clientes
router.get("/", getAllClients);

module.exports = router;
