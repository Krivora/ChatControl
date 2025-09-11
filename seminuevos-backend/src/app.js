const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/client.routes");
const interactionRoutes = require("./routes/interaction.routes");
const messageRoutes = require("./routes/message.routes");
const clientRoutes = require("./routes/client.routes");

const app = express();

app.use(cors());
app.use(cors({
  origin: "http://localhost:5173"
}));
app.use(express.json());

// Rutas
app.use("/api/users", userRoutes);
app.use("/api/interactions", interactionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/clients", clientRoutes);

module.exports = app;
