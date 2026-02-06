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
npm start  # Lance le serveur en production
npm run dev  # Lance le serveur en mode développement avec nodemon
npm test  # Tests (à implémenter)
```

## 🚀 Démarrage

1. Installer les dépendances:
```bash
npm install
```

2. Configurer les variables d'environnement:
```bash
cp .env.example .env
```

3. Configurer la base de données:
```bash
npx prisma migrate dev
```

4. Lancer le serveur:
```bash
npm run dev
```

Le serveur sera accessible sur `http://localhost:3000`

## 📊 Architecture

L'application suit une architecture MVC (Modèle-Vue-Contrôleur) adaptée à une API REST:
- **Routes**: Définissent les endpoints API
- **Contrôleurs**: Contiennent la logique métier
- **Middlewares**: Gèrent l'authentification, autorisation et validation
- **Utilitaires**: Fonctions réutilisables
- **Base de données**: Gérée par Prisma avec MySQL