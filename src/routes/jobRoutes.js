const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const applyToJobController = require("../controllers/apply_to_jobController");
const { authenticateToken, authorizeRole } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Gestion des offres d'emploi
 */

router.get("/", jobController.getAllJobs);
router.get("/:id", jobController.getJobById);
router.post("/:id/apply", authenticateToken, applyToJobController.applyToJob);

router.post("/", authenticateToken, authorizeRole(["ADMIN"]), jobController.createJob);
router.put("/:id", authenticateToken, authorizeRole(["ADMIN"]), jobController.updateJob);
router.delete("/:id", authenticateToken, authorizeRole(["ADMIN"]), jobController.deleteJob);

module.exports = router;
