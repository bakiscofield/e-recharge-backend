#!/bin/bash

# Script pour synchroniser la base de données locale vers la production
# ⚠️ ATTENTION : Ce script supprime TOUTES les données de production avant l'import !

set -e  # Arrêt en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
LOCAL_DB="prisma/dev.db"
EXPORT_FILE="database-export.sql"
BACKUP_FILE="production-backup-$(date +%Y%m%d-%H%M%S).db"

echo -e "${YELLOW}=== SYNCHRONISATION BASE LOCALE -> PRODUCTION ===${NC}\n"

# Vérifier que la base locale existe
if [ ! -f "$LOCAL_DB" ]; then
    echo -e "${RED}❌ Erreur: La base locale '$LOCAL_DB' n'existe pas${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Base locale trouvée: $LOCAL_DB${NC}\n"

# 1. Exporter la base locale
echo -e "${YELLOW}📤 Étape 1: Export de la base locale...${NC}"
sqlite3 "$LOCAL_DB" ".dump" > "$EXPORT_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Export réussi: $EXPORT_FILE${NC}"
    echo -e "   Taille: $(du -h $EXPORT_FILE | cut -f1)\n"
else
    echo -e "${RED}❌ Erreur lors de l'export${NC}"
    exit 1
fi

# 2. Afficher un résumé des données
echo -e "${YELLOW}📊 Résumé des données à exporter:${NC}"
echo "------------------------------------"
sqlite3 "$LOCAL_DB" << 'EOF'
.mode column
.headers on
SELECT
    'Users' as Table, COUNT(*) as Count FROM User
UNION ALL
SELECT 'Orders', COUNT(*) FROM "Order"
UNION ALL
SELECT 'Bookmakers', COUNT(*) FROM Bookmaker
UNION ALL
SELECT 'PaymentMethods', COUNT(*) FROM PaymentMethod
UNION ALL
SELECT 'AppConfig', COUNT(*) FROM AppConfig;
EOF
echo "------------------------------------"
echo ""

echo -e "${GREEN}✅ Fichier d'export créé: $EXPORT_FILE${NC}\n"

echo -e "${YELLOW}📋 Instructions pour le serveur de production:${NC}"
echo "------------------------------------"
echo "1. Copiez le fichier d'export vers le serveur:"
echo -e "   ${GREEN}scp $EXPORT_FILE root@votreserveur.com:/home/e-recharge-backend/${NC}\n"
echo "2. Connectez-vous au serveur et exécutez:"
echo -e "   ${GREEN}cd /home/e-recharge-backend${NC}"
echo -e "   ${GREEN}bash scripts/import-from-local.sh${NC}\n"
echo "------------------------------------"
