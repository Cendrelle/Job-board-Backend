const multer = require("multer");
const fs = require("fs");
const path = require("path");

const cvUploadDir = path.join(process.cwd(), "uploads", "cvs");
const photoUploadDir = path.join(process.cwd(), "uploads", "photos");
fs.mkdirSync(cvUploadDir, { recursive: true });
fs.mkdirSync(photoUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "photo") {
      cb(null, photoUploadDir);
      return;
    }
    cb(null, cvUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user-${req.user.id}-${file.fieldname}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "cv" && file.mimetype === "application/pdf") {
    cb(null, true);
    return;
  }

  if (
    file.fieldname === "photo" &&
    ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)
  ) {
    cb(null, true);
    return;
  }

  cb(new Error("Fichier invalide: cv en PDF, photo en JPG/PNG/WEBP"), false);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
