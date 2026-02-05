const express = require("express");
const helmet = require("helmet"); // Sécurise les headers HTTP
const cors = require("cors");     // Gère les autorisations d'accès entre domaines
const authRoutes = require("./routes/auth.routes"); // Import de ton travail de Phase 2

const app = express();

// --- Middlewares Globaux ---
app.use(helmet()); 
app.use(cors());
app.use(express.json()); // Permet de lire les données JSON envoyées (ex: login/password)

// --- Tes Routes (Phase 2) ---
// Toutes tes routes d'authentification commenceront par /api/auth
app.use("/api/auth", authRoutes); 

// --- Route de base ---
app.get("/", (req, res) => {
  res.json({ message: "API Job Board - Serveur opérationnel " });
});

module.exports = app;