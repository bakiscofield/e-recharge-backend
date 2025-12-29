# Synchronisation Base Locale → Production

⚠️ **ATTENTION** : Ces scripts suppriment TOUTES les données de production avant l'import !

## Prérequis

- Accès SSH au serveur de production
- SQLite3 installé localement et sur le serveur
- Droits d'écriture sur la base de production

## Utilisation

### Étape 1 : Sur votre machine locale

```bash
cd /chemin/vers/pwa-bookmaker/backend

# Rendre le script exécutable
chmod +x scripts/sync-local-to-prod.sh

# Exécuter le script d'export
./scripts/sync-local-to-prod.sh
```

Ce script va :
1. ✅ Exporter votre base locale (`prisma/dev.db`) vers `database-export.sql`
2. 📊 Afficher un résumé des données à exporter
3. 📋 Donner les instructions pour l'import en production

### Étape 2 : Copier le fichier vers le serveur

```bash
# Depuis votre machine locale
scp database-export.sql root@votreserveur.com:/home/e-recharge-backend/
```

### Étape 3 : Sur le serveur de production

```bash
# Se connecter au serveur
ssh root@votreserveur.com

# Aller dans le dossier backend
cd /home/e-recharge-backend

# Rendre le script exécutable
chmod +x scripts/import-from-local.sh

# Exécuter le script d'import
./scripts/import-from-local.sh
```

Le script vous demandera une confirmation (tapez `OUI` en majuscules).

Ce script va :
1. 💾 Créer un backup automatique de la base de production
2. 📊 Afficher les données actuelles
3. 🗑️ Supprimer la base de production
4. 📥 Importer les données locales
5. 📊 Afficher les données importées
6. 🔄 Redémarrer l'application (si PM2 est disponible)

## Restauration en cas de problème

Si quelque chose se passe mal, les backups sont sauvegardés avec un timestamp :

```bash
# Liste des backups
ls -lah production-backup-*.db

# Restaurer un backup
cp production-backup-YYYYMMDD-HHMMSS.db production.db

# Redémarrer l'application
pm2 restart all
```

## Sécurité

- ⚠️ **NE JAMAIS** exécuter ces scripts sans avoir vérifié les données
- 💾 Toujours vérifier que le backup est créé avant l'import
- 🔒 Ces scripts nécessitent une confirmation explicite (`OUI`)
- 📧 Informez l'équipe avant une synchronisation en production

## Exemple complet

```bash
# Local
cd ~/Documents/pwa-bookmaker/backend
./scripts/sync-local-to-prod.sh
scp database-export.sql root@srv460526.hstgr.cloud:/home/e-recharge-backend/

# Serveur
ssh root@srv460526.hstgr.cloud
cd /home/e-recharge-backend
./scripts/import-from-local.sh
# Taper: OUI
```

## Vérification post-import

```bash
# Sur le serveur
cd /home/e-recharge-backend

# Vérifier les utilisateurs
sqlite3 production.db "SELECT email, role FROM User;"

# Vérifier les logs de l'application
pm2 logs
```
