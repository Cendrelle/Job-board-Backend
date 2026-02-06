const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");


const { authenticateToken, authorizeRole } = require("../middlewares/authMiddleware");

router.get("/", jobController.getAllJobs);
router.get("/:id", jobController.getJobById);

router.post("/", authenticateToken, authorizeRole(["ADMIN"]), jobController.createJob);
router.put("/:id", authenticateToken, authorizeRole(["ADMIN"]), jobController.updateJob);
router.delete("/:id", authenticateToken, authorizeRole(["ADMIN"]), jobController.deleteJob);

module.exports = router;
