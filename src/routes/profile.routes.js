const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const { uploadCv } = require("../controllers/profileController");
const auth = require("../middlewares/auth");

router.post("/upload-cv", auth, upload.single("cv"), uploadCv);

module.exports = router;
