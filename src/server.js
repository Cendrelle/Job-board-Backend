require("dotenv").config();
const app = require("./app");
const jobRoutes = require('./routes/jobRoutes');
const PORT = process.env.PORT || 8000;

app.use('/api/jobs', jobRoutes);

app.listen(PORT, () => {
  console.log(`Serveur Express lancé sur http://localhost:${PORT}`);
});
