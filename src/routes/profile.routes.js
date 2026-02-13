const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const { authenticateToken, authorizeRole } = require("../middlewares/authMiddleware");
const {
  createOrUpdateProfile,
  getAllProfiles,
  getMyProfile,
  getPublicProfiles,
} = require("../controllers/profileController");

/**
 * @swagger
 * tags:
 *   name: Profiles
 *   description: Gestion des profils candidats
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ProfileInput:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         phone:
 *           type: string
 *         competences:
 *           type: string
 *         formation:
 *           type: string
 *         experiences:
 *           type: string
 *         cv:
 *           type: string
 *       required:
 *         - firstName
 *         - lastName
 */

/**
 * @swagger
 * /api/profile:
 *   post:
 *     summary: Creer ou mettre a jour le profil
 *     tags: [Profiles]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ProfileInput'
 *     responses:
 *       200:
 *         description: Profil enregistre
 *       400:
 *         description: Donnees invalides
 *       401:
 *         description: Non authentifie
 */
router.post(
  "/profile",
  authenticateToken,
  upload.single("cv"),
  createOrUpdateProfile
);

router.get("/profile/me", authenticateToken, getMyProfile);

/**
 * @swagger
 * /api/public/profiles:
 *   get:
 *     summary: Lister tous les profils (public)
 *     tags: [Profiles]
 *     responses:
 *       200:
 *         description: Liste des profils
 */
// Lister tous les profils (public)
router.get("/public/profiles", getPublicProfiles);

/**
 * @swagger
 * /api/profiles:
 *   get:
 *     summary: Lister tous les profils (admin)
 *     tags: [Profiles]
 *     responses:
 *       200:
 *         description: Liste des profils
 *       401:
 *         description: Non authentifie
 *       403:
 *         description: Acces refuse
 */
// Lister tous les profils (admin)
router.get("/profiles", authenticateToken, authorizeRole(["ADMIN"]), getAllProfiles);

module.exports = router;
