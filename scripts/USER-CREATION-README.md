# Scripts de Création d'Utilisateurs

Scripts pour créer rapidement des utilisateurs avec différents rôles.

---

## 🚀 Scripts Rapides (Production)

### 1. Créer un Super Admin

```bash
./scripts/create-super-admin-quick.sh [email] [phone] [password] [prenom] [nom] [pays]

# Exemple
./scripts/create-super-admin-quick.sh superadmin@app.com 90000000 SuperPass123! Super Admin TG
```

### 2. Créer un Admin

```bash
./scripts/create-admin-quick.sh [email] [phone] [password] [prenom] [nom] [pays]

# Exemple
./scripts/create-admin-quick.sh admin@app.com 90000001 AdminPass123! Jean Dupont TG
```

### 3. Créer un Agent/Caissier

```bash
./scripts/create-agent-quick.sh [email] [phone] [password] [prenom] [nom] [pays]

# Exemple
./scripts/create-agent-quick.sh agent@app.com 90111111 AgentPass123! Koffi Agent TG
```

---

## 📝 Script Interactif

Pour créer n'importe quel type d'utilisateur avec des prompts interactifs :

```bash
node scripts/create-user.js
```

Le script vous demandera :
1. Le rôle à créer (Super Admin, Admin, Agent, Support, Client)
2. Email
3. Téléphone
4. Mot de passe
5. Prénom
6. Nom
7. Pays

---

## 🎯 Exemples d'Utilisation sur le Serveur

### Créer plusieurs utilisateurs rapidement

```bash
cd /home/e-recharge-backend

# 1. Super Admin
./scripts/create-super-admin-quick.sh superadmin@app.com 90000000 SuperPass123!

# 2. Admin principal
./scripts/create-admin-quick.sh admin@app.com 90000001 AdminPass123! Jean Dupont TG

# 3. Agents pour différents pays
./scripts/create-agent-quick.sh agent.tg@app.com 90111111 Agent123! Koffi Agent TG
./scripts/create-agent-quick.sh agent.bj@app.com 95222222 Agent123! Awa Agent BJ
./scripts/create-agent-quick.sh agent.ci@app.com 07333333 Agent123! Yao Agent CI
```

---

## 📊 Tableau Récapitulatif

| Script | Rôle | isSuperAdmin | Exemple |
|--------|------|--------------|---------|
| `create-super-admin-quick.sh` | SUPER_ADMIN | ✅ true | Gestion complète |
| `create-admin-quick.sh` | ADMIN | ❌ false | Administration |
| `create-agent-quick.sh` | AGENT | ❌ false | Caissier/Agent |
| `create-user.js` | Au choix | Selon rôle | Tous types |

---

## ✅ Caractéristiques

Tous les utilisateurs créés ont automatiquement :
- ✅ `isActive: true`
- ✅ `isVerified: true`
- ✅ `emailVerified: true`
- ✅ Mot de passe hashé avec bcrypt
- ✅ Code de parrainage unique

---

## 🔄 Mise à Jour d'Utilisateur Existant

Si un utilisateur avec le même email ou téléphone existe :
- **Scripts rapides** : Mettent à jour l'utilisateur en changeant son rôle et mot de passe
- **Script interactif** : Affiche une erreur

---

## 📋 Valeurs par Défaut

### Super Admin
- Email: `superadmin@alicebot.com`
- Téléphone: `90000000`
- Mot de passe: `SuperAdmin2024!`

### Admin
- Email: `admin@alicebot.com`
- Téléphone: `90000001`
- Mot de passe: `Admin123!`

### Agent
- Email: `agent@alicebot.com`
- Téléphone: `90111111`
- Mot de passe: `Agent123!`

---

## 🛡️ Sécurité

⚠️ **Important** :

1. **Changez immédiatement** les mots de passe par défaut après la première connexion
2. **Utilisez des mots de passe forts** en production
3. Pour éviter que les mots de passe apparaissent dans l'historique :
   ```bash
   # Utiliser le script interactif
   node scripts/create-user.js
   ```

---

## 🔍 Vérification après Création

```bash
# Vérifier tous les utilisateurs
sqlite3 production.db "SELECT email, phone, role, isActive FROM User;"

# Compter par rôle
sqlite3 production.db << EOF
SELECT role, COUNT(*) as total FROM User GROUP BY role;
EOF
```

---

## 🚨 Dépannage

### Erreur "User already exists"

Options :
1. Changer l'email ou le téléphone
2. Utiliser un script rapide qui mettra à jour l'utilisateur
3. Supprimer l'utilisateur existant d'abord

### Utilisateur créé mais ne peut pas se connecter

Vérifiez :
```bash
sqlite3 production.db << EOF
SELECT email, role, isActive, isVerified, emailVerified,
       CASE WHEN password IS NULL THEN 'NO PASSWORD' ELSE 'HAS PASSWORD' END
FROM User WHERE email = 'votre-email@example.com';
EOF
```

Tous les champs doivent être à `1` (true) sauf le mot de passe qui doit être "HAS PASSWORD".

---

## 📞 Support

Pour plus d'aide, consultez :
- `ADMIN-README.md` - Documentation détaillée Super Admin
- `README.md` - Documentation générale des scripts
