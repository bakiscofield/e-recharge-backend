# Scripts de Création de Super Admin

## 1. Script Interactif (Recommandé)

Utilise des prompts pour demander toutes les informations.

### Usage

```bash
node scripts/create-super-admin.js
```

Le script demandera :
- Email
- Téléphone
- Mot de passe
- Prénom
- Nom
- Pays

### Exemple

```bash
$ node scripts/create-super-admin.js

=== CRÉATION D'UN SUPER ADMIN ===

Email: admin@example.com
Téléphone: 90123456
Mot de passe: MonMotDePasse123!
Prénom: Jean
Nom: Dupont
Pays: TG

📋 Résumé:
------------------------------------
Email:      admin@example.com
Téléphone:  90123456
Nom:        Jean Dupont
Pays:       TG
Rôle:       SUPER_ADMIN
------------------------------------

Confirmer la création ? (oui/non): oui

✅ SUPER ADMIN CRÉÉ AVEC SUCCÈS
```

---

## 2. Script Rapide (Pour production)

Création rapide avec des paramètres en ligne de commande.

### Usage

```bash
# Avec valeurs par défaut
./scripts/create-super-admin-quick.sh

# Avec paramètres personnalisés
./scripts/create-super-admin-quick.sh email@example.com 90123456 MotDePasse123!

# Avec tous les paramètres
./scripts/create-super-admin-quick.sh email@example.com 90123456 MotDePasse123! Jean Dupont TG
```

### Paramètres

1. **Email** (défaut: `superadmin@alicebot.com`)
2. **Téléphone** (défaut: `90000000`)
3. **Mot de passe** (défaut: `SuperAdmin2024!`)
4. **Prénom** (défaut: `Super`)
5. **Nom** (défaut: `Admin`)
6. **Pays** (défaut: `TG`)

### Exemple sur le serveur de production

```bash
cd /home/e-recharge-backend

# Créer avec valeurs par défaut
chmod +x scripts/create-super-admin-quick.sh
./scripts/create-super-admin-quick.sh

# Ou avec des valeurs personnalisées
./scripts/create-super-admin-quick.sh admin@myapp.com 90999999 MySecurePass123!

# Connexion
# Email: admin@myapp.com
# Password: MySecurePass123!
```

---

## Caractéristiques du Super Admin créé

Les super admins créés avec ces scripts ont :

- ✅ `role: SUPER_ADMIN`
- ✅ `isSuperAdmin: true`
- ✅ `isActive: true`
- ✅ `isVerified: true`
- ✅ `emailVerified: true`
- ✅ Mot de passe hashé avec bcrypt
- ✅ Code de parrainage unique généré automatiquement

---

## Sécurité

⚠️ **Important** :

1. **Changez le mot de passe par défaut** immédiatement après la première connexion
2. N'utilisez **jamais** le script rapide avec des mots de passe en clair dans l'historique de commandes en production
3. Pour la production, préférez le **script interactif** qui ne stocke pas les mots de passe dans l'historique

---

## Mise à jour d'un utilisateur existant

Si un utilisateur avec le même email ou téléphone existe déjà :
- Le **script interactif** affichera une erreur
- Le **script rapide** mettra à jour l'utilisateur existant en super admin

---

## Dépannage

### Erreur "User already exists"

Un utilisateur avec cet email ou téléphone existe déjà. Options :

1. Utilisez un email/téléphone différent
2. Utilisez le script rapide qui mettra à jour l'utilisateur existant
3. Supprimez l'utilisateur existant d'abord

### Erreur de connexion à la base de données

Vérifiez que :
- Le fichier `production.db` existe
- La variable `DATABASE_URL` est correctement configurée
- Les dépendances sont installées (`npm install`)
