const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRole } = require("../middlewares/authMiddleware");
const {
  getDashboardStats,
  getPendingCandidateProfiles,
  updateCandidateConfirmation,
  updateCandidateContractStatus,
  getAdminJobs,
} = require("../controllers/adminController");

router.get(
  "/dashboard/stats",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  getDashboardStats
);

router.get(
  "/candidatures/pending",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  getPendingCandidateProfiles
);

router.patch(
  "/candidatures/:profileId/confirmation",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  updateCandidateConfirmation
);

router.patch(
  "/candidatures/:profileId/contract",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  updateCandidateContractStatus
);

router.get(
  "/jobs",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  getAdminJobs
);

module.exports = router;
