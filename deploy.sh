#!/bin/bash
# ============================================
# Palmier — Deploy to palmiercotedazur.fr
# Usage: ./deploy.sh
# ============================================

set -e

VPS_USER="ubuntu"
VPS_HOST="51.255.207.0"
SSH_KEY="$HOME/.ssh/vps_palmier"
REMOTE_DIR="~/palmier"

echo "🌴 Palmier — Déploiement sur palmiercotedazur.fr"
echo "================================================="

# 1. Check for uncommitted changes
if ! git diff --quiet HEAD 2>/dev/null; then
    echo ""
    echo "⚠️  Tu as des changements non commités:"
    git status --short
    echo ""
    read -p "Continuer quand même ? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Annulé. Commite d'abord tes changements."
        exit 1
    fi
fi

# 2. Push to GitHub
echo ""
echo "📤 Push vers GitHub..."
git push origin master

# 3. Pull on VPS
echo ""
echo "📥 Pull sur le VPS..."
ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "cd $REMOTE_DIR && git pull origin master"

# 4. Rebuild & restart containers
echo ""
echo "🐳 Rebuild & restart Docker..."
ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "cd $REMOTE_DIR && docker compose up -d --build"

# 5. Wait for services to be ready
echo ""
echo "⏳ Attente des services..."
sleep 10

# 6. Health check
echo ""
echo "🔍 Vérification..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://palmiercotedazur.fr)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Site en ligne ! https://palmiercotedazur.fr"
else
    echo "⚠️  Le site répond HTTP $HTTP_CODE — vérifie les logs:"
    echo "   ssh -i $SSH_KEY $VPS_USER@$VPS_HOST 'cd $REMOTE_DIR && docker compose logs --tail=20'"
fi

echo ""
echo "🎉 Déploiement terminé !"
