# Job-board-Backend

## 📋 Aperçu du Projet

Ce projet backend est le cœur fonctionnel d'une plateforme de recrutement (Job Board).
Il fournit une API REST sécurisée permettant la gestion complète des utilisateurs, des offres d'emploi et des candidatures, tout en assurant la logique métier et la persistance des données.

## 🏗️ Structure du Projet

```
.
├── package.json                 # Dépendances et scripts npm
├── README.md                    # Documentation du projet
├── prisma/                      # Configuration base de données
│   ├── schema.prisma           # Modèle de données Prisma
│   └── migrations/             # Migrations de base de données
│       ├── migration_lock.toml
│       └── 20260205131311_init_job_board/
│           └── migration.sql
└── src/                         # Code source principal
    ├── app.js                  # Configuration Express
    ├── server.js               # Point d'entrée du serveur
    ├── config/                 # Configuration
    │   └── swagger.js          # Documentation API Swagger
    ├── controllers/            # Contrôleurs métier
    │   └── authController.js   # Gestion authentification
    ├── middlewares/            # Middlewares Express
    │   ├── checkRole.js        # Vérification des rôles
    │   └── verifyToken.js      # Vérification des tokens JWT
    ├── routes/                 # Définition des routes API
    │   └── auth.routes.js      # Routes d'authentification
    └── utils/                  # Fonctions utilitaires
        └── auth.js             # Utilitaires d'authentification
```

## ✨ Fonctionnalités Principales

1. **Gestion des Utilisateurs**: Création, authentification et gestion des profils utilisateurs
2. **Gestion des Offres d'Emploi**: CRUD complet pour les offres de travail
3. **Gestion des Candidatures**: Suivi des candidatures des utilisateurs
4. **Système d'Authentification**: Authentification sécurisée avec JWT
5. **Contrôle d'Accès par Rôle (RBAC)**: Gestion des permissions basée sur les rôles
6. **Sécurité HTTP**: Headers HTTP sécurisés
7. **CORS**: Gestion des requêtes cross-origin
8. **Documentation API**: Documentation Swagger intégrée

## 🛠️ Outils et Packages Utilisés

### Framework & Serveur
- **Express.js**: Framework web Node.js pour construire l'API REST

### Base de Données & ORM
- **Prisma**: ORM moderne pour gérer les interactions avec MySQL
- **MySQL**: Base de données relationnelle

### Sécurité
- **Helmet**: Middleware pour sécuriser les headers HTTP
- **CORS**: Middleware pour gérer les autorisations cross-origin
- **JWT (JSON Web Tokens)**: Authentification sécurisée via tokens

### Configuration & Environnement
- **dotenv**: Gestion des variables d'environnement

### Documentation
- **Swagger UI Express**: Documentation API interactive

### Développement
- **Nodemon**: Rechargement automatique du serveur en développement

## 📦 Scripts disponibles

```bash
npm start                # Lance le serveur en production
npm run dev              # Lance le serveur en mode développement avec nodemon
npm run db:seed          # Initialise l'admin par défaut
npm run db:reset-admin   # Réinitialise le mot de passe admin
npm test                 # Tests (à implémenter)
```

## 🚀 Démarrage Rapide

### Première installation (avec seed admin automatique)

```bash
# 1. Installer les dépendances
npm install

# 2. Copier et configurer les variables d'environnement
cp .env.example .env

# 3. Éditer .env et configurer :
#    - DATABASE_URL (point d'accès à MySQL)
#    - JWT_SECRET (clé secrète pour les tokens)
#    - ADMIN_EMAIL et ADMIN_PASSWORD (optionnel, défauts fournis)

# 4. Créer la base de données et appliquer les migrations
npx prisma migrate deploy
# OU en développement :
npx prisma migrate dev

# 5. Initialiser le compte admin (AUTOMATIQUE lors de la migration dev)
npm run db:seed

# 6. Lancer le serveur
npm run dev
```

Le serveur sera accessible sur `http://localhost:3000`
Documentation API : `http://localhost:3000/api-docs`

### Réinitialiser le mot de passe admin

Si vous oubliez le mot de passe admin, vous pouvez le réinitialiser :

```bash
# Assurez-vous que ADMIN_EMAIL et ADMIN_PASSWORD sont corrects dans .env
npm run db:reset-admin
```

## 🔐 Identifiants par défaut

**ℹ️ IMPORTANT**: Ces identifiants sont fournis pour le développement local uniquement.

| Champ | Valeur | Configuration |
|-------|--------|--------------|
| Email | `admin@jobbooster.com` | Variable `ADMIN_EMAIL` dans `.env` |
| Mot de passe | `AdminPassword123!` | Variable `ADMIN_PASSWORD` dans `.env` |

**Avant de déployer en production:**
1. Changez obligatoirement les identifiants dans `.env`
2. Exécutez `npm run db:seed` pour mettre à jour la base de données
3. Configurez `JWT_SECRET` avec une clé sécurisée

## 📊 Architecture

L'application suit une architecture MVC (Modèle-Vue-Contrôleur) adaptée à une API REST:
- **Routes**: Définissent les endpoints API
- **Contrôleurs**: Contiennent la logique métier
- **Middlewares**: Gèrent l'authentification, autorisation et validation
- **Utilitaires**: Fonctions réutilisables
- **Base de données**: Gérée par Prisma avec MySQL

## 🔄 Flux d'authentification

1. **Inscription** (`POST /api/auth/register`):
   - Email et mot de passe sont envoyés
   - Le mot de passe est hashé avec bcryptjs
   - Un nouvel utilisateur est créé (rôle: CANDIDATE par défaut)

2. **Connexion** (`POST /api/auth/login`):
   - Email et mot de passe sont envoyés
   - Les identifiants sont vérifiés
   - Un JWT token est généré (valable 24h)
   - Token contient : `{ id, role }`

3. **Accès aux routes protégées**:
   - Le token JWT est envoyé dans le header `Authorization: Bearer TOKEN`
   - Middleware `verifyToken` valide le token
   - Middleware `checkRole` vérifie les permissions par rôle
   - La requête est autorisée ou rejetée

## 🗂️ Hiérarchie des fichiers après setup

```
.
├── .env                 # Configuration locale (À NE PAS commiter)
├── .env.example         # Template pour .env
├── package.json
├── README.md
├── prisma/
│   ├── package.json     # Configuration Prisma Seed
│   ├── seed.js          # Script d'initialisation admin
│   ├── reset.js         # Script de réinitialisation password admin
│   ├── schema.prisma
│   └── migrations/
└── src/
    ├── app.js
    ├── server.js
    ├── config/
    │   └── swagger.js
    ├── controllers/
    │   └── authController.js
    ├── middlewares/
    │   ├── checkRole.js
    │   └── verifyToken.js
    ├── routes/
    │   └── auth.routes.js
    └── utils/
        └── auth.js
```

## 📊 Architecture

L'application suit une architecture MVC (Modèle-Vue-Contrôleur) adaptée à une API REST:
- **Routes**: Définissent les endpoints API
- **Contrôleurs**: Contiennent la logique métier
- **Middlewares**: Gèrent l'authentification, autorisation et validation
- **Utilitaires**: Fonctions réutilisables
- **Base de données**: Gérée par Prisma avec MySQL