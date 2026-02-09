const nodemailer = require('nodemailer');

/**
 * Créer un transporteur email unique (réutilisable)
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,    // email Gmail
    pass: process.env.EMAIL_PASSWORD, // App Password Gmail
  },
});

/**
 * Fonction générique pour envoyer un email
 * @param {string} to - Email destinataire
 * @param {string} subject - Sujet
 * @param {string} text - Texte plein (fallback)
 * @param {string} html - HTML (optionnel)
 * @returns {Promise<boolean>} true si succès, false sinon
 */
const sendEmail = async (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      ...(html && { html }), // Ajoute html seulement s'il existe
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email envoyé à ${to}:`, info.messageId);
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de l'envoi de l'email à ${to}:`, error.message);
    return false;
  }
};

/**
 * Envoyer une notification de candidature à l'admin
 * @param {string} adminEmail - Email de l'admin
 * @param {Object} candidateInfo - { id, email }
 * @param {Object} jobInfo - { id, title, companyName }
 */
const sendApplicationNotificationToAdmin = async (
  adminEmail,
  candidateInfo,
  jobInfo
) => {
  const subject = `📋 Nouvelle candidature reçue - ${jobInfo.title}`;

  const text = `
Nouvelle candidature reçue!

Offre d'emploi: ${jobInfo.title}
Entreprise: ${jobInfo.companyName}
ID Job: ${jobInfo.id}

Candidat:
Email: ${candidateInfo.email}
ID Utilisateur: ${candidateInfo.id}
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Nouvelle Candidature Reçue</h2>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>📌 Offre d'emploi:</strong> ${jobInfo.title}</p>
        <p><strong>🏢 Entreprise:</strong> ${jobInfo.companyName}</p>
        <p><strong>ID Job:</strong> ${jobInfo.id}</p>
      </div>

      <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>👤 Candidat:</strong></p>
        <p>Email: <a href="mailto:${candidateInfo.email}">${candidateInfo.email}</a></p>
        <p>ID Utilisateur: ${candidateInfo.id}</p>
      </div>

      <p style="color: #666; font-size: 12px;">
        Consultez le tableau de bord pour plus de détails sur cette candidature.
      </p>
    </div>
  `;

  return sendEmail(adminEmail, subject, text, html);
};

module.exports = {
  sendEmail,
  sendApplicationNotificationToAdmin,
};
