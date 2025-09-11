const express = require("express");
const router = express.Router();
const { getAllInteractions } = require("../controllers/interaction.controller");

router.get("/", getAllInteractions);

module.exports = router;
