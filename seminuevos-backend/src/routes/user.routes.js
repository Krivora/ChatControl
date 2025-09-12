const express = require("express");
const router = express.Router();
const { getAllUsers, createUser, editUser } = require("../controllers/user.controller");

router.get("/", getAllUsers);
router.post("/", createUser);
router.put("/:id", editUser); // ← PUT para editar usuario

module.exports = router;
