# Scripts Backend

## test-fix-passwords.js

Script pour tester et corriger les mots de passe des utilisateurs en production.

### Utilisation

```bash
# Sur le serveur de production
cd /home/e-recharge-backend
node scripts/test-fix-passwords.js
```

### Ce que fait le script

1. Teste si les hashes de mots de passe actuels correspondent aux mots de passe attendus
2. Si les hashes sont invalides, régénère et met à jour tous les mots de passe
3. Vérifie que tous les utilisateurs peuvent se connecter

### Mots de passe par défaut

- **Utilisateurs réguliers** (Admin, Support, Agents, Clients) : `password123`
- **Super Admin** : `SuperAdmin2024!`

### Identifiants de test

```
Client:
  Email: client@test.com
  Phone: +22890999999
  Password: password123

Admin:
  Email: admin@alicebot.com
  Phone: +22890000001
  Password: password123

Agent (Togo):
  Email: agent1@alicebot.com
  Phone: +22890111111
  Password: password123

Super Admin:
  Email: superadmin@alicebot.com
  Password: SuperAdmin2024!
```

⚠️ **Important** : Changez ces mots de passe en production après les tests !
