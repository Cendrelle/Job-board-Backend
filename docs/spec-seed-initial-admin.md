Fiche de Spécification : Tâche Backend - Seeding Admin Initial
1. Description de la tâche
Développer un script d'initialisation (Seed) permettant de garantir la présence d'un compte administrateur fonctionnel dès le premier lancement de l'application. Ce compte est indispensable pour accéder aux routes protégées du périmètre "Admin" (gestion des offres et des candidats).

2. Spécifications Fonctionnelles
Idempotence : Le script doit pouvoir être exécuté plusieurs fois sans créer de doublons ni générer d'erreurs si l'utilisateur existe déjà.
Sécurisation des identifiants : Aucun identifiant (email ou mot de passe) ne doit être écrit en dur dans le code source. Ils doivent être injectés via les variables d'environnement (.env).
Attribution du rôle : L'utilisateur créé doit impérativement posséder le flag ou le rôle ADMIN en base de données pour passer les futurs middlewares d'autorisation.
3. Spécifications Techniques (Postures SWE)
Outil : Utilisation du mécanisme intégré à l'ORM (Prisma Seed).
Flux de traitement :
Lecture des variables ADMIN_EMAIL et ADMIN_PASSWORD depuis l'environnement.
Hashage du mot de passe via la bibliothèque de sécurité choisie (bcryptjs).
Commande Upsert : Recherche par email. Si absent → Création. Si présent → Mise à jour du rôle uniquement pour garantir les droits.
Déclenchement : Le script doit être configuré pour être appelé via une commande standard (npx prisma db seed).
4. Critères d'Acceptation (Definition of Done)

Le script s'exécute sans erreur sur une base de données vide.

Une seconde exécution consécutive ne crée pas d'entrée supplémentaire dans la table User.

Le mot de passe stocké en base de données est correctement hashé (non lisible en clair).

Un log de succès est affiché dans le terminal à la fin du processus.

La documentation Swagger indique les identifiants par défaut (ou la méthode pour les configurer) pour permettre aux testeurs/devs front de se connecter.
