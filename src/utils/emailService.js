const nodemailer = require("nodemailer");

const hasSmtpConfig =
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASSWORD;

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  : nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

const sendEmail = async (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.EMAIL_USER,
      to,
      subject,
      text,
      ...(html && { html }),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email envoye a ${to}:`, info.messageId);
    return true;
  } catch (error) {
    console.error(`Erreur lors de l'envoi de l'email a ${to}:`, error.message);
    return false;
  }
};

const sendApplicationNotificationToAdmin = async (
  adminEmail,
  candidateInfo,
  jobInfo
) => {
  const subject = `Nouvelle candidature recue - ${jobInfo.title}`;

  const text = `
Nouvelle candidature recue!

Offre d'emploi: ${jobInfo.title}
Entreprise: ${jobInfo.companyName}
ID Job: ${jobInfo.id}

Candidat:
Email: ${candidateInfo.email}
ID Utilisateur: ${candidateInfo.id}
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Nouvelle Candidature Recue</h2>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Offre d'emploi:</strong> ${jobInfo.title}</p>
        <p><strong>Entreprise:</strong> ${jobInfo.companyName}</p>
        <p><strong>ID Job:</strong> ${jobInfo.id}</p>
      </div>
      <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Candidat:</strong></p>
        <p>Email: <a href="mailto:${candidateInfo.email}">${candidateInfo.email}</a></p>
        <p>ID Utilisateur: ${candidateInfo.id}</p>
      </div>
      <p style="color: #666; font-size: 12px;">
        Consultez le tableau de bord pour plus de details sur cette candidature.
      </p>
    </div>
  `;

  return sendEmail(adminEmail, subject, text, html);
};

module.exports = {
  sendEmail,
  sendApplicationNotificationToAdmin,
};
