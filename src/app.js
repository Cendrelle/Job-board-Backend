const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/auth.routes");
const jobRoutes = require("./routes/jobRoutes");
const profileRoutes = require("./routes/profile.routes");
const adminRoutes = require("./routes/admin.routes");
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
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api", profileRoutes);
app.use("/api/admin", adminRoutes);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Route de test
app.get("/", (req, res) => {
  res.json({ message: "API Job Board - Serveur operationnel" });
});

module.exports = app;
