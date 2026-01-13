#!/bin/bash

# Script de vérification du système d'upload d'images
# Usage: ./scripts/check-uploads.sh

echo "🔍 Vérification du système d'upload d'images"
echo "=============================================="
echo ""

# 1. Vérifier le dossier uploads
echo "1️⃣ Vérification du dossier uploads..."
UPLOAD_DIR="./public/uploads"

if [ -d "$UPLOAD_DIR" ]; then
    echo "   ✅ Le dossier $UPLOAD_DIR existe"

    # Permissions
    PERMS=$(stat -c "%a" "$UPLOAD_DIR" 2>/dev/null || stat -f "%Lp" "$UPLOAD_DIR" 2>/dev/null)
    echo "   📂 Permissions: $PERMS"

    # Propriétaire
    OWNER=$(stat -c "%U:%G" "$UPLOAD_DIR" 2>/dev/null || stat -f "%Su:%Sg" "$UPLOAD_DIR" 2>/dev/null)
    echo "   👤 Propriétaire: $OWNER"

    # Nombre de fichiers
    FILE_COUNT=$(find "$UPLOAD_DIR" -type f | wc -l)
    echo "   📊 Nombre de fichiers: $FILE_COUNT"

    # Taille totale
    TOTAL_SIZE=$(du -sh "$UPLOAD_DIR" | cut -f1)
    echo "   💾 Taille totale: $TOTAL_SIZE"
else
    echo "   ❌ Le dossier $UPLOAD_DIR n'existe pas"
    echo "   🔧 Création du dossier..."
    mkdir -p "$UPLOAD_DIR"
    if [ $? -eq 0 ]; then
        echo "   ✅ Dossier créé avec succès"
    else
        echo "   ❌ Impossible de créer le dossier"
        exit 1
    fi
fi

echo ""

# 2. Vérifier les variables d'environnement
echo "2️⃣ Vérification des variables d'environnement..."

if [ -f ".env" ]; then
    echo "   ✅ Fichier .env trouvé"

    # Vérifier APP_URL
    APP_URL=$(grep "^APP_URL=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
    if [ -z "$APP_URL" ]; then
        echo "   ⚠️  APP_URL non définie dans .env"
        echo "      Les URLs d'images utiliseront http://localhost:3001 par défaut"
    else
        echo "   ✅ APP_URL=$APP_URL"
    fi

    # Vérifier FRONTEND_URL
    FRONTEND_URL=$(grep "^FRONTEND_URL=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
    if [ -z "$FRONTEND_URL" ]; then
        echo "   ⚠️  FRONTEND_URL non définie dans .env"
    else
        echo "   ✅ FRONTEND_URL=$FRONTEND_URL"
    fi
else
    echo "   ❌ Fichier .env non trouvé"
    echo "   🔧 Copiez .env.example vers .env et configurez-le"
fi

echo ""

# 3. Test d'écriture
echo "3️⃣ Test d'écriture dans le dossier uploads..."
TEST_FILE="$UPLOAD_DIR/.test-write"
if touch "$TEST_FILE" 2>/dev/null; then
    echo "   ✅ Écriture possible"
    rm "$TEST_FILE"
else
    echo "   ❌ Impossible d'écrire dans le dossier"
    echo "   🔧 Vérifiez les permissions:"
    echo "      sudo chown -R \$USER:\$USER $UPLOAD_DIR"
    echo "      chmod -R 755 $UPLOAD_DIR"
fi

echo ""

# 4. Vérifier si le serveur est en cours d'exécution
echo "4️⃣ Vérification du serveur..."
if lsof -i:3001 >/dev/null 2>&1; then
    echo "   ✅ Le serveur écoute sur le port 3001"

    # Test d'upload si curl est disponible
    if command -v curl &> /dev/null; then
        echo ""
        echo "   💡 Pour tester l'upload:"
        echo "      curl -X POST http://localhost:3001/api/v1/upload/image \\"
        echo "        -H 'Authorization: Bearer YOUR_TOKEN' \\"
        echo "        -F 'file=@/path/to/image.png'"
    fi
else
    echo "   ⚠️  Le serveur n'écoute pas sur le port 3001"
    echo "      Démarrez le serveur avec: npm run start:dev"
fi

echo ""
echo "=============================================="
echo "✨ Vérification terminée"
echo ""

# Afficher les derniers fichiers uploadés
if [ "$FILE_COUNT" -gt 0 ]; then
    echo "📸 5 derniers fichiers uploadés:"
    find "$UPLOAD_DIR" -type f -printf '%T+ %p\n' 2>/dev/null | sort -r | head -5 | while read -r line; do
        echo "   $line"
    done
fi
