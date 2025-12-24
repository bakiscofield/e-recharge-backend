# AliceBot PWA - Backend

Backend API pour AliceBot, une plateforme de gestion de dépôts et retraits pour bookmakers.

## 🚀 Technologies

- **NestJS** - Framework Node.js progressif
- **TypeScript** - Langage typé
- **Prisma** - ORM moderne pour PostgreSQL
- **PostgreSQL** - Base de données relationnelle
- **JWT** - Authentification sécurisée
- **WebSocket** - Chat en temps réel
- **Swagger** - Documentation API interactive

## 📋 Fonctionnalités

### Authentification & Autorisation
- ✅ Inscription avec email/téléphone
- ✅ Vérification par code OTP (SMS)
- ✅ Connexion avec JWT
- ✅ RBAC (Role-Based Access Control)
- ✅ Permissions granulaires

### Gestion des Commandes
- ✅ Création de demandes de dépôt/retrait
- ✅ Assignation automatique aux agents
- ✅ Validation par les agents
- ✅ Historique complet des transactions
- ✅ Statistiques en temps réel

### Système de Notifications
- ✅ Notifications push web
- ✅ Notifications par email
- ✅ Notifications en temps réel via WebSocket
- ✅ Centre de notifications dans l'app

### Chat en Temps Réel
- ✅ Chat entre clients et agents
- ✅ Indicateurs de frappe
- ✅ Statut en ligne/hors ligne
- ✅ Marquage des messages comme lus

### Administration
- ✅ Dashboard admin avec statistiques
- ✅ Gestion des utilisateurs
- ✅ Gestion des bookmakers
- ✅ Gestion des moyens de paiement
- ✅ Configuration dynamique de l'app
- ✅ Système de thèmes personnalisables

### Super Admin
- ✅ Gestion des administrateurs
- ✅ Vue globale de toutes les transactions
- ✅ Assignation agents-bookmakers-paiements
- ✅ Statistiques globales
- ✅ Configuration système

### Autres
- ✅ Système de parrainage avec commissions
- ✅ Newsletter
- ✅ Upload de fichiers (images)
- ✅ Logs d'audit
- ✅ Rate limiting
- ✅ CORS configuré

## 🛠 Installation

### Prérequis

- Node.js >= 18
- PostgreSQL >= 14
- npm ou yarn

### Configuration

1. **Cloner le dépôt**
```bash
git clone https://github.com/bakiscofield/e-recharge-backend.git
cd e-recharge-backend
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env
```

Modifiez le fichier `.env` avec vos valeurs :
```env
DATABASE_URL="postgresql://user:password@localhost:5432/alicebot_db"
JWT_SECRET="votre-secret-tres-securise"
SMTP_HOST=smtp.gmail.com
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe
# ... autres variables
```

4. **Configurer la base de données**
```bash
# Créer la base de données
createdb alicebot_db

# Générer le client Prisma
npx prisma generate

# Exécuter les migrations
npx prisma migrate deploy

# Peupler la base avec les données initiales
npm run seed
```

5. **Créer un super admin**
```bash
npm run create-super-admin
```

## 🚀 Démarrage

### Développement
```bash
npm run start:dev
```

Le serveur démarre sur http://localhost:3001

### Production
```bash
# Build
npm run build

# Démarrer
npm run start:prod
```

## 📚 Documentation API

Une fois le serveur démarré, accédez à la documentation Swagger :
```
http://localhost:3001/api/docs
```

## 🏗 Structure du Projet

```
src/
├── admin/              # Module administration
├── auth/               # Authentification & autorisation
│   ├── decorators/     # Décorateurs custom
│   ├── dto/            # Data Transfer Objects
│   └── guards/         # Guards de sécurité
├── bookmakers/         # Gestion des bookmakers
├── chat/               # Chat en temps réel
├── config/             # Configuration de l'app
├── newsletter/         # Gestion des newsletters
├── notifications/      # Système de notifications
├── orders/             # Gestion des commandes
├── payment-methods/    # Moyens de paiement
├── prisma/             # Service Prisma
├── rbac/               # Role-Based Access Control
├── referral/           # Système de parrainage
├── scripts/            # Scripts utilitaires
├── super-admin/        # Module super admin
├── theme/              # Gestion des thèmes
├── upload/             # Upload de fichiers
├── users/              # Gestion des utilisateurs
└── main.ts             # Point d'entrée
```

## 🗄 Schéma de Base de Données

Le schéma Prisma complet est disponible dans `prisma/schema.prisma`

Principales entités :
- **User** - Utilisateurs (clients, agents, admins)
- **Order** - Commandes de dépôt/retrait
- **Bookmaker** - Bookmakers supportés
- **PaymentMethod** - Moyens de paiement
- **EmployeePaymentMethod** - Assignations agents-bookmakers
- **Notification** - Notifications
- **Conversation & Message** - Chat
- **Role & Permission** - RBAC
- **ReferralCode** - Codes de parrainage

## 🔐 Sécurité

- ✅ Hashage des mots de passe avec bcrypt
- ✅ JWT avec expiration
- ✅ Rate limiting contre les attaques brute force
- ✅ Validation des entrées avec class-validator
- ✅ CORS configuré
- ✅ Headers de sécurité avec Helmet
- ✅ Logs d'audit pour traçabilité

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Couverture
npm run test:cov
```

## 📝 Scripts Utiles

```bash
# Créer un super admin
npm run create-super-admin

# Vérifier si un super admin existe
npm run check-super-admin

# Initialiser les permissions
npm run init-permissions

# Générer les clés VAPID pour push notifications
npx web-push generate-vapid-keys

# Voir les logs Prisma
npx prisma studio
```

## 🌐 Déploiement

### Avec PM2
```bash
npm install -g pm2
pm2 start npm --name "alicebot-backend" -- run start:prod
pm2 save
pm2 startup
```

### Avec Docker
```bash
docker build -t alicebot-backend .
docker run -p 3001:3001 alicebot-backend
```

## 🔧 Configuration Nginx

Exemple de configuration nginx disponible dans le fichier `nginx-back-alice.conf`

## 📊 Monitoring

- Logs d'application : `logs/backend.log`
- Logs nginx : `/var/log/nginx/back_alice_*.log`
- PM2 monitoring : `pm2 monit`

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est privé et propriétaire.

## 👥 Auteur

**AliceBot Team**

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
