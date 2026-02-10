const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const { authenticateToken} = require("../middlewares/authMiddleware");
const { createOrUpdateProfile, getAllProfiles, } = require("../controllers/profileController");

router.post(
  "/profile",
  authenticateToken,
  upload.single("cv"), // CV + champs texte ensemble
  createOrUpdateProfile
);
// Lister tous les profils (admin / recruteur)
router.get("/profiles", authenticateToken, getAllProfiles);
module.exports = router;
