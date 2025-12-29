# Scripts de Suppression d'Utilisateurs

⚠️ **ATTENTION: Ces scripts suppriment définitivement les utilisateurs !**

---

## 🗑️ Scripts Disponibles

### 1. Script Interactif (Recommandé)

Supprime tous les utilisateurs d'un rôle spécifique avec confirmation.

```bash
node scripts/delete-users-by-role.js
```

Le script vous demandera :
1. Quel rôle supprimer (Agent, Admin, Support, Client, Super Admin)
2. Affiche la liste des utilisateurs qui seront supprimés
3. Demande confirmation en tapant "SUPPRIMER"

### 2. Script Rapide - Supprimer tous les Agents

```bash
./scripts/delete-agents-quick.sh
```

### 3. Script Rapide - Supprimer tous les Admins

```bash
./scripts/delete-admins-quick.sh
```

---

## 🚀 Exemples d'Utilisation

### Sur le serveur de production

```bash
cd /home/e-recharge-backend

# 1. Supprimer tous les agents
./scripts/delete-agents-quick.sh
# Tapez: SUPPRIMER

# 2. Supprimer tous les admins
./scripts/delete-admins-quick.sh
# Tapez: SUPPRIMER

# 3. Script interactif pour choisir le rôle
node scripts/delete-users-by-role.js
# Choisissez le rôle
# Tapez: SUPPRIMER
```

---

## ⚠️ Sécurité et Précautions

### Avant de supprimer

1. **Vérifiez les utilisateurs existants** :
```bash
sqlite3 production.db "SELECT email, phone, role FROM User WHERE role='AGENT';"
```

2. **Créez un backup** :
```bash
cp production.db production-backup-$(date +%Y%m%d-%H%M%S).db
```

### Protection

- ✅ Confirmation requise (tapez "SUPPRIMER")
- ✅ Liste des utilisateurs affichée avant suppression
- ✅ Compteur du nombre d'utilisateurs supprimés
- ⚠️ **AUCUN BACKUP AUTOMATIQUE** - Créez-en un manuellement !

---

## 📊 Vérification après Suppression

```bash
# Compter les utilisateurs par rôle
sqlite3 production.db << EOF
.headers on
.mode column
SELECT role, COUNT(*) as total FROM User GROUP BY role;
EOF

# Voir tous les utilisateurs restants
sqlite3 production.db "SELECT email, phone, role FROM User;"
```

---

## 🔄 Restauration en cas d'erreur

Si vous avez supprimé des utilisateurs par erreur :

```bash
# 1. Restaurer depuis le backup
cp production-backup-YYYYMMDD-HHMMSS.db production.db

# 2. Redémarrer l'application
pm2 restart all

# 3. Vérifier que les données sont restaurées
sqlite3 production.db "SELECT COUNT(*) FROM User;"
```

---

## 📝 Cas d'Usage

### Nettoyage périodique

```bash
# Supprimer tous les agents inactifs (utiliser le script interactif)
node scripts/delete-users-by-role.js
# Choisir: 1 (AGENT)
# Confirmer: SUPPRIMER
```

### Réinitialisation de test

```bash
# Supprimer tous les utilisateurs de test
./scripts/delete-agents-quick.sh
./scripts/delete-admins-quick.sh

# Puis recréer les utilisateurs
./scripts/create-agent-quick.sh agent@app.com 90111111 Agent123!
./scripts/create-admin-quick.sh admin@app.com 90000001 Admin123!
```

---

## 🚨 Limitations

- ❌ Ne supprime **PAS** automatiquement les données liées (commandes, conversations, etc.)
- ❌ Suppression en cascade gérée par Prisma selon le schéma
- ⚠️ Les super admins peuvent être supprimés (soyez prudent !)

---

## 💡 Conseils

1. **Toujours créer un backup avant suppression massive**
2. **Utiliser le script interactif** pour voir exactement qui sera supprimé
3. **Vérifier les relations** avant de supprimer (commandes, etc.)
4. **Tester d'abord en local** avant d'exécuter en production

---

## 🔗 Scripts Complémentaires

- `create-user.js` - Créer des utilisateurs
- `create-agent-quick.sh` - Créer des agents
- `create-admin-quick.sh` - Créer des admins
- `USER-CREATION-README.md` - Documentation création

---

## ⚠️ AVERTISSEMENT FINAL

**CES SCRIPTS SUPPRIMENT DÉFINITIVEMENT LES DONNÉES !**

Il n'y a **AUCUN MOYEN** de récupérer les données supprimées sans backup.

Toujours :
1. ✅ Créer un backup avant
2. ✅ Vérifier la liste des utilisateurs
3. ✅ Confirmer que vous voulez vraiment supprimer
4. ✅ Tester en local d'abord
