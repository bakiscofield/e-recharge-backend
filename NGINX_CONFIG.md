# Configuration Nginx pour servir les images uploadées

## Problème
Les images uploadées via `/api/v1/upload/image` ne s'affichent pas en production car :
1. L'URL générée pointe vers `APP_URL/uploads/filename`
2. Nginx doit savoir comment servir ces fichiers

## Solution 1 : Nginx sert les fichiers statiques directement (Recommandé)

Cette approche est plus performante car Nginx sert les fichiers sans passer par Node.js.

```nginx
server {
    listen 80;
    server_name api.votredomaine.com;

    # Servir les fichiers uploadés directement
    location /uploads/ {
        alias /chemin/vers/votre/backend/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Proxyer les requêtes API vers NestJS
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Étapes :
1. Remplacer `/chemin/vers/votre/backend/public/uploads/` par le chemin absolu réel
2. Vérifier les permissions : `sudo chown -R www-data:www-data /chemin/vers/backend/public/uploads`
3. Redémarrer Nginx : `sudo systemctl restart nginx`

## Solution 2 : Tout proxyer vers NestJS

Plus simple mais moins performant.

```nginx
server {
    listen 80;
    server_name api.votredomaine.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Augmenter les timeouts pour les uploads
        client_max_body_size 10M;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

## Variables d'environnement requises

Dans votre fichier `.env` de production :

```bash
# URL publique de votre API (IMPORTANT !)
APP_URL=https://api.votredomaine.com
# OU
BACKEND_URL=https://api.votredomaine.com

# Frontend URL pour CORS
FRONTEND_URL=https://votredomaine.com
```

## Vérification

### 1. Vérifier que le dossier uploads existe
```bash
ls -la /chemin/vers/backend/public/uploads
```

### 2. Vérifier les permissions
```bash
# Le serveur web (www-data sur Ubuntu) doit pouvoir lire et écrire
sudo chown -R www-data:www-data /chemin/vers/backend/public/uploads
sudo chmod -R 755 /chemin/vers/backend/public/uploads
```

### 3. Tester l'upload
```bash
curl -X POST https://api.votredomaine.com/api/v1/upload/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.png"
```

Vous devriez recevoir une réponse avec une URL comme :
```json
{
  "url": "https://api.votredomaine.com/uploads/abc123.png",
  "filename": "abc123.png",
  "size": 12345,
  "mimetype": "image/png"
}
```

### 4. Tester l'accès à l'image
```bash
curl -I https://api.votredomaine.com/uploads/abc123.png
```

Vous devriez voir `HTTP/1.1 200 OK`.

## Dépannage

### Images uploadées mais URL 404
- Vérifier la variable `APP_URL` dans `.env`
- Vérifier la configuration Nginx (location /uploads/)
- Vérifier les logs : `sudo tail -f /var/log/nginx/error.log`
- Vérifier les logs NestJS : `pm2 logs` ou dans vos logs d'application

### Erreur de permissions
```bash
sudo chown -R www-data:www-data /chemin/vers/backend/public/uploads
sudo chmod -R 755 /chemin/vers/backend/public/uploads
```

### Dossier uploads n'existe pas
L'application le crée automatiquement au démarrage. Vérifier les logs au démarrage :
```
📁 Serving static files from: /chemin/vers/backend/public/uploads
✅ Created uploads directory: /chemin/vers/backend/public/uploads
```

Si le dossier n'est pas créé, créez-le manuellement :
```bash
mkdir -p /chemin/vers/backend/public/uploads
sudo chown -R www-data:www-data /chemin/vers/backend/public/uploads
```
