#!/bin/bash

# Script d'initialisation de la base de données
# Usage: ./setup-db.sh [production|development]

# Couleurs pour les logs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Déterminer l'environnement
ENV=${1:-development}

if [ "$ENV" = "production" ]; then
    ENV_FILE=".env.production"
    echo -e "${BLUE}🗄️  Configuration de la base de données (PRODUCTION)${NC}"
else
    ENV_FILE=".env"
    echo -e "${BLUE}🗄️  Configuration de la base de données (DEVELOPMENT)${NC}"
fi

# Vérifier que le fichier .env existe
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Fichier $ENV_FILE introuvable${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Chargement des variables depuis $ENV_FILE${NC}"

# Charger les variables d'environnement
set -a
source "$ENV_FILE"
set +a

# Vérifier que DATABASE_URL est défini
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL n'est pas défini dans $ENV_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✓ DATABASE_URL: $DATABASE_URL${NC}"
echo ""

# Étape 1: Générer le client Prisma
echo -e "${BLUE}1️⃣  Génération du client Prisma...${NC}"
npx prisma generate
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors de la génération du client Prisma${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Client Prisma généré${NC}"
echo ""

# Étape 2: Appliquer les migrations
echo -e "${BLUE}2️⃣  Application des migrations...${NC}"
if [ "$ENV" = "production" ]; then
    npx prisma migrate deploy
else
    npx prisma migrate dev
fi
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors des migrations${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Migrations appliquées${NC}"
echo ""

# Étape 3: Seeding (optionnel)
read -p "Voulez-vous peupler la base de données avec les données initiales ? (o/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Oo]$ ]]; then
    echo -e "${BLUE}3️⃣  Seeding de la base de données...${NC}"
    npx prisma db seed
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Erreur lors du seeding${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Base de données peuplée${NC}"
fi

echo ""
echo -e "${GREEN}✅ Configuration de la base de données terminée!${NC}"
