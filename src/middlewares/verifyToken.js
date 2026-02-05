const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // 1. Récupérer le token dans le header "Authorization"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ message: "Accès refusé. Token manquant." });
    }

    try {
        // 2. Vérifier si le token est authentique
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'votre_cle_secrete');
        req.user = verified; // On stocke les infos (id, role) pour la suite
        next(); // On autorise la requête à continuer
    } catch (err) {
        res.status(403).json({ message: "Token invalide ou expiré." });
    }
};

module.exports = verifyToken;