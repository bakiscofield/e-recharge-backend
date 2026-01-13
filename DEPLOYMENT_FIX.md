# Fix pour l'erreur DATABASE_URL sur le serveur

## Problème
L'application en production affiche l'erreur :
```
Error: error: Environment variable not found: DATABASE_URL.
  -->  schema.prisma:10
   |
10 |   url      = env("DATABASE_URL")
   |
```

## Cause
Le fichier `.env.production` utilisait un chemin relatif `file:./production.db` au lieu d'un chemin absolu, ce qui causait des problèmes de résolution de chemin pour Prisma.

## Solution

### Étape 1: Mettre à jour le fichier .env.production sur le serveur

Connectez-vous au serveur et éditez le fichier `/home/e-recharge-backend/.env.production` :

```bash
ssh votre-serveur
cd /home/e-recharge-backend
nano .env.production
```

Modifiez la ligne `DATABASE_URL` pour utiliser le chemin absolu :

```env
# Avant
DATABASE_URL="file:./production.db"

# Après
DATABASE_URL="file:/home/e-recharge-backend/prisma/production.db"
```

### Étape 2: Vérifier que toutes les variables sont présentes

Assurez-vous que votre fichier `.env.production` contient toutes les variables nécessaires. Référez-vous au fichier `.env.production` mis à jour dans ce dépôt.

Les variables obligatoires sont :
- NODE_ENV=production
- PORT=5004
- DATABASE_URL (avec chemin absolu)
- JWT_SECRET
- APP_URL, FRONTEND_URL, BACKEND_URL
- SMTP_* (pour les emails)
- FIREBASE_* (pour FCM)
- VAPID_* (pour les notifications push)

### Étape 3: Créer le dossier prisma s'il n'existe pas

```bash
cd /home/e-recharge-backend
mkdir -p prisma
```

### Étape 4: Redémarrer l'application PM2

```bash
pm2 restart main
pm2 logs main --lines 50
```

### Étape 5: Vérifier que l'application démarre correctement

```bash
# Voir les logs en temps réel
pm2 logs main

# Vérifier le statut
pm2 status

# Tester l'API
curl https://back-alice.alicebot.online/api/v1
```

## Commandes utiles pour le déploiement futur

### Déployer les modifications depuis votre machine locale

```bash
# Dans le dossier backend local
cd /home/bakiscofield/Documents/pwa-bookmaker/backend

# Copier le fichier .env.production vers le serveur
scp .env.production votre-user@votre-serveur:/home/e-recharge-backend/.env.production

# Ou pousser sur git et tirer sur le serveur
git add .env.production
git commit -m "fix: Update DATABASE_URL to use absolute path"
git push

# Sur le serveur
ssh votre-serveur
cd /home/e-recharge-backend
git pull
pm2 restart main
```

## Vérifications post-déploiement

1. L'application démarre sans erreur Prisma
2. La base de données SQLite est créée dans `/home/e-recharge-backend/prisma/production.db`
3. Les endpoints API répondent correctement
4. Les logs PM2 ne montrent pas d'erreurs

## Note importante

Le fichier `.env.production` contient des informations sensibles (clés API, secrets, etc.).
Assurez-vous de :
- Ne PAS le commiter dans un dépôt public
- Utiliser des permissions restrictives sur le serveur : `chmod 600 .env.production`
- Changer les secrets par défaut en production
