#!/bin/bash

# Script pour importer les données locales en production
# ⚠️ ATTENTION : Ce script SUPPRIME TOUTES les données de production !

set -e  # Arrêt en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROD_DB="production.db"
IMPORT_FILE="database-export.sql"
BACKUP_FILE="production-backup-$(date +%Y%m%d-%H%M%S).db"

echo -e "${RED}⚠️  ATTENTION - OPÉRATION DANGEREUSE ⚠️${NC}\n"
echo -e "Ce script va:"
echo -e "  ${RED}1. SUPPRIMER toutes les données de production${NC}"
echo -e "  ${GREEN}2. Importer les données depuis le fichier local${NC}\n"

# Vérifier que le fichier d'import existe
if [ ! -f "$IMPORT_FILE" ]; then
    echo -e "${RED}❌ Erreur: Le fichier d'import '$IMPORT_FILE' n'existe pas${NC}"
    echo -e "${YELLOW}Copiez d'abord le fichier depuis votre machine locale:${NC}"
    echo -e "  scp $IMPORT_FILE root@serveur:/home/e-recharge-backend/"
    exit 1
fi

# Vérifier que la base de production existe
if [ ! -f "$PROD_DB" ]; then
    echo -e "${RED}❌ Erreur: La base de production '$PROD_DB' n'existe pas${NC}"
    exit 1
fi

# Demander confirmation
echo -e "${YELLOW}Voulez-vous vraiment continuer ? (tapez 'OUI' en majuscules)${NC}"
read -p "> " confirmation

if [ "$confirmation" != "OUI" ]; then
    echo -e "${YELLOW}❌ Opération annulée${NC}"
    exit 0
fi

echo ""

# 1. Backup de la base de production
echo -e "${YELLOW}💾 Étape 1: Sauvegarde de la base de production...${NC}"
cp "$PROD_DB" "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup créé: $BACKUP_FILE${NC}"
    echo -e "   Taille: $(du -h $BACKUP_FILE | cut -f1)\n"
else
    echo -e "${RED}❌ Erreur lors du backup${NC}"
    exit 1
fi

# 2. Afficher les données actuelles
echo -e "${YELLOW}📊 Données actuelles en production:${NC}"
echo "------------------------------------"
sqlite3 "$PROD_DB" << 'EOF'
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

# 3. Supprimer la base de production
echo -e "${RED}🗑️  Étape 2: Suppression de la base de production...${NC}"
rm "$PROD_DB"
echo -e "${GREEN}✅ Base de production supprimée${NC}\n"

# 4. Créer une nouvelle base vide
echo -e "${YELLOW}🆕 Étape 3: Création d'une nouvelle base...${NC}"
touch "$PROD_DB"
echo -e "${GREEN}✅ Nouvelle base créée${NC}\n"

# 5. Importer les données
echo -e "${YELLOW}📥 Étape 4: Import des données locales...${NC}"
sqlite3 "$PROD_DB" < "$IMPORT_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Import réussi${NC}\n"
else
    echo -e "${RED}❌ Erreur lors de l'import${NC}"
    echo -e "${YELLOW}Restauration du backup...${NC}"
    cp "$BACKUP_FILE" "$PROD_DB"
    echo -e "${GREEN}✅ Backup restauré${NC}"
    exit 1
fi

# 6. Vérifier les données importées
echo -e "${YELLOW}📊 Données après import:${NC}"
echo "------------------------------------"
sqlite3 "$PROD_DB" << 'EOF'
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

# 7. Redémarrer l'application
echo -e "${YELLOW}🔄 Étape 5: Redémarrage de l'application...${NC}"
if command -v pm2 &> /dev/null; then
    pm2 restart all
    echo -e "${GREEN}✅ Application redémarrée avec PM2${NC}\n"
else
    echo -e "${YELLOW}⚠️  PM2 non trouvé. Redémarrez manuellement l'application${NC}\n"
fi

echo -e "${GREEN}✅✅✅ SYNCHRONISATION TERMINÉE AVEC SUCCÈS ✅✅✅${NC}\n"
echo -e "${YELLOW}📋 Fichiers créés:${NC}"
echo -e "  - Backup: $BACKUP_FILE"
echo -e "  - Base actuelle: $PROD_DB"
echo ""
