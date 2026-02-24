#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Palmier — Deploy / update on production server
#
# Usage:
#   ./scripts/deploy.sh          # Pull latest + restart
#   ./scripts/deploy.sh --build  # Force rebuild images
# ─────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.prod.yml"
BUILD_FLAG=""

if [[ "${1:-}" == "--build" ]]; then
    BUILD_FLAG="--build"
fi

echo "=== Palmier — Deploy ==="
echo "Project: $PROJECT_DIR"
echo ""

# 1. Pull latest code
echo "[1/4] Pulling latest code..."
cd "$PROJECT_DIR"
git pull --ff-only

# 2. Backup before deploy
echo "[2/4] Running pre-deploy backup..."
"$SCRIPT_DIR/backup.sh" || echo "[warn] Backup failed, continuing deploy..."

# 3. Build & restart services
echo "[3/4] Restarting services..."
docker compose -f "$COMPOSE_FILE" up -d $BUILD_FLAG

# 4. Health check
echo "[4/4] Waiting for services..."
sleep 10

HEALTH=$(docker compose -f "$COMPOSE_FILE" exec -T backend curl -sf http://localhost:8000/api/health 2>/dev/null || echo "FAIL")

if echo "$HEALTH" | grep -q "ok"; then
    echo ""
    echo "=== Deploy successful ==="
    echo "Frontend: https://palmiercotedazur.fr"
    echo "API:      https://palmiercotedazur.fr/api/health"
    echo "PB Admin: https://palmiercotedazur.fr/pb/_/"
else
    echo ""
    echo "=== WARNING: Health check failed ==="
    echo "Check logs: docker compose -f $COMPOSE_FILE logs --tail=50"
fi
