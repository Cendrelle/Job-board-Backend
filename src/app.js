const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const jobRoutes = require("./routes/jobRoutes");
const profileRoutes = require("./routes/profile.routes");
const applyRoutes = require("./routes/auth.routes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./config/swagger");
const cookieParser = require("cookie-parser");

const app = express();
const allowedOrigins = [
  "http://localhost:3001",
  "http://localhost:3000",
];


// Middlewares
app.use(helmet());
<<<<<<< HEAD
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
=======
app.use(cors({
  origin: 'http://localhost:3001', // ⚠️ ici tu dois mettre ton frontend exact quand tu es en local. En production, ce sera l'URL du frontend unique 
  credentials: true,               // ✅ permet d'envoyer les cookies
}));
>>>>>>> origin/feat/cookie
app.use(express.json());
app.use(express.urlencoded({ extended: true }));   // <--- IMPORTANT !!
app.use(cookieParser());
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
