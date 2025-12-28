#!/bin/bash

# Script de déploiement PM2 pour E-Recharge Backend
# Lance uniquement le backend sur le port 5001

echo "🚀 Déploiement E-Recharge Backend avec PM2..."
echo ""

# Couleurs pour les logs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier si PM2 est installé
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}❌ PM2 n'est pas installé${NC}"
    echo -e "${YELLOW}💡 Installez PM2 avec: npm install -g pm2${NC}"
    exit 1
fi

# Vérifier que nous sommes dans le bon dossier
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erreur: package.json non trouvé${NC}"
    echo -e "${YELLOW}💡 Exécutez ce script depuis le dossier backend${NC}"
    exit 1
fi

# Vérifier que le fichier .env.production existe
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ Fichier .env.production non trouvé${NC}"
    echo -e "${YELLOW}💡 Créez le fichier .env.production avec vos variables${NC}"
    exit 1
fi

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Installation des dépendances...${NC}"
    npm install
fi

# Créer le dossier de logs s'il n'existe pas
mkdir -p logs

# Build du backend
echo -e "${BLUE}📦 Build du backend...${NC}"
npm install
npm install --save-dev typescript @types/node
npx prisma generate
npx tsc
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors du build du backend${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Backend build réussi${NC}"
echo ""

# Initialiser la base de données si nécessaire
if [ ! -f "prisma/production.db" ]; then
    echo -e "${BLUE}🗄️  Initialisation de la base de données...${NC}"

    # Charger les variables d'environnement depuis .env.production
    if [ -f ".env.production" ]; then
        export $(cat .env.production | grep -v '^#' | xargs)
    fi

    npx prisma generate
    npx prisma migrate deploy

    # Demander si on veut peupler la DB
    read -p "Voulez-vous peupler la base de données ? (o/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Oo]$ ]]; then
        npx prisma db seed
    fi

    echo -e "${GREEN}✓ Base de données initialisée${NC}"
    echo ""
fi

echo -e "${BLUE}🔧 Démarrage du service PM2...${NC}"

# Arrêter l'ancien processus s'il existe
pm2 delete e-recharge-backend 2>/dev/null

# Charger les variables d'environnement et démarrer avec PM2
export $(cat .env.production | grep -v '^#' | xargs)
pm2 start ecosystem.config.js --env production

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Backend démarré avec succès!${NC}"
    echo ""
    echo -e "${BLUE}📊 Statut du service:${NC}"
    pm2 status
    echo ""
    echo -e "${BLUE}📱 Informations:${NC}"
    echo -e "   Nom:     e-recharge-backend"
    echo -e "   Port:    5004"
    echo -e "   URL:     https://back_alice.alicebot.online"
    echo ""
    echo -e "${YELLOW}💡 Commandes utiles:${NC}"
    echo -e "   pm2 status                   - Voir le statut"
    echo -e "   pm2 logs e-recharge-backend  - Voir les logs"
    echo -e "   pm2 restart e-recharge-backend - Redémarrer"
    echo -e "   pm2 stop e-recharge-backend  - Arrêter"
    echo -e "   pm2 delete e-recharge-backend - Supprimer"
    echo -e "   pm2 monit                    - Monitoring en temps réel"
    echo ""

    # Sauvegarder la configuration PM2
    pm2 save

    # Générer le script de démarrage au boot (optionnel)
    echo -e "${YELLOW}💡 Pour démarrer automatiquement au boot du serveur:${NC}"
    echo -e "   pm2 startup"
    echo -e "   puis exécutez la commande affichée"
else
    echo -e "${RED}❌ Erreur lors du démarrage${NC}"
    exit 1
fi
