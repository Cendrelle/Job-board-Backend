const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const { authenticateToken} = require("../middlewares/authMiddleware");
const { createOrUpdateProfile } = require("../controllers/profileController");

router.post(
  "/profile",
  authenticateToken,
  upload.single("cv"), // CV + champs texte ensemble
  createOrUpdateProfile
);

module.exports = router;
