
require("dotenv").config();
const { execSync } = require("child_process");
const app = require("./app");
const PORT = process.env.PORT || 5000;

// Fonction pour exécuter le seed automatiquement
async function runSeedIfNeeded() {
  try {
    if (process.env.NODE_ENV === "development") {
      console.log("🌱 Initialisation du compte admin...");
      execSync("npm run db:seed", { stdio: "inherit" });
    }
  } catch (error) {
    console.warn(
      "⚠️ Impossible d'exécuter le seed (la base de données pourrait ne pas être prête)"
    );
    console.warn("Exécutez manuellement: npm run db:seed");
  }
}

// Lancer le seed, puis le serveur
runSeedIfNeeded().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Serveur Express lancé sur http://localhost:${PORT}`);
    console.log(`📚 Documentation API: http://localhost:${PORT}/api-docs`);
  });
});
