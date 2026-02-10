const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const jobRoutes = require("./routes/jobRoutes");
const profileRoutes = require("./routes/profile.routes");
const applyRoutes = require("./routes/auth.routes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./config/swagger");

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));   // <--- IMPORTANT !!

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api", profileRoutes); // <-- Notez le préfixe "/api" pour les routes de profil
app.use("/api", applyRoutes); // Route pour application de la candidature
// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Route de test
app.get("/", (req, res) => {
  res.json({ message: "API Job Board - Serveur opérationnel" });
});

module.exports = app;
