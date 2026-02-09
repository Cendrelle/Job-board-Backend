const prisma = require("../prisma/client");

exports.uploadCv = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Aucun fichier envoyé" });
  }

  const cvPath = `/uploads/cvs/${req.file.filename}`;

  await prisma.profile.update({
    where: { userId: req.user.id },
    data: { cv: cvPath },
  });

  res.json({
    message: "CV uploadé avec succès",
    cv: cvPath,
  });
};
