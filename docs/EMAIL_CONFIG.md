# Configuration des Notifications par Email

## Vue d'ensemble
Le système envoie automatiquement un email à l'admin chaque fois qu'une candidature est soumise.

## Configuration SMTP

### Avec Gmail
1. Activer l'Authentification à 2 facteurs sur le compte Gmail
2. Générer un "App Password" : https://myaccount.google.com/apppasswords
3. Dans `.env`, ajouter:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=votre_email@gmail.com
   SMTP_PASSWORD=votre_app_password_16_caracteres
   SMTP_FROM=votre_email@gmail.com
   ADMIN_EMAIL=admin@jobbooster.com
   ```

### Avec un serveur SMTP personnalisé
Remplacer les paramètres `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` selon votre fournisseur.

### Avec Mailtrap (tests)
```
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=votre_username
SMTP_PASSWORD=votre_password
SMTP_FROM=noreply@jobboard.com
```

## Flux
1. L'utilisateur envoie une candidature → `POST /api/jobs/:id/apply`
2. La candidature est créée dans la base
3. Un email est envoyé **asynchronement** à l'admin (ne bloque pas la réponse)
4. Une réponse 201 est envoyée au candidat

## Format de l'email
- **Sujet**: `📋 Nouvelle candidature reçue - [titre du job]`
- **Contenu**: infos du job, du candidat, et du poste

## Gestion des erreurs
- Si l'email échoue, l'erreur est loggée mais **ne bloque pas** la candidature
- La candidature est toujours créée même si l'email échoue

## Variables d'environnement requises
```
SMTP_HOST          # Hôte SMTP du serveur mail
SMTP_PORT          # Port SMTP (587 pour TLS, 465 pour SSL)
SMTP_SECURE        # true ou false (SSL/TLS)
SMTP_USER          # Email/username pour l'authentification
SMTP_PASSWORD      # Mot de passe ou app password
SMTP_FROM          # Adresse "From" des emails
ADMIN_EMAIL        # Email où envoyer les notifications
```

Si ces variables ne sont pas définies, le système fonctionne mais les emails ne seront pas envoyés.
