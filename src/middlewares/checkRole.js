const checkRole = (role) => {
  return (req, res, next) => {
    // On vérifie si le rôle dans le token correspond au rôle requis (ADMIN)
    if (req.user && req.user.role === role) {
      next(); // C'est bon, on laisse passer
    } else {
      return res.status(403).json({ message: "Accès refusé : Droits insuffisants." });
    }
  };
};

module.exports = checkRole;