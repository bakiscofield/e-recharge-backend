#!/bin/bash

# Script de démarrage automatique avec gestion Prisma
# Ce script est appelé par PM2 au démarrage

echo "🔄 Préparation du backend..."

# Régénération du schéma Prisma (EN PREMIER)
echo "📦 Génération du client Prisma..."
npx prisma generate

# Charger les variables d'environnement
if [ -f ".env.production" ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
elif [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Synchronisation avec la base de données (migrations)
echo "🔄 Application des migrations Prisma..."
npx prisma migrate deploy

echo "✅ Base de données synchronisée"

# Lancer l'application
echo "🚀 Démarrage de l'application..."
node dist/src/main.js
