#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Nice Outside — Daily PocketBase backup
#
# Usage:
#   ./scripts/backup.sh
#
# Cron (every day at 3 AM):
#   0 3 * * * /home/pi/nice-outside/scripts/backup.sh
# ─────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_DIR}/backups"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
KEEP_DAYS=14

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Find the PocketBase data volume
PB_DATA=$(docker volume inspect nice-outside_pb_data --format '{{ .Mountpoint }}' 2>/dev/null || true)

if [ -z "$PB_DATA" ]; then
    # Fallback: copy from container
    echo "[backup] Copying from PocketBase container..."
    CONTAINER=$(docker compose -f "$PROJECT_DIR/docker-compose.prod.yml" ps -q pocketbase 2>/dev/null || \
                docker compose -f "$PROJECT_DIR/docker-compose.yml" ps -q pocketbase 2>/dev/null || true)

    if [ -z "$CONTAINER" ]; then
        echo "[backup] ERROR: PocketBase container not found"
        exit 1
    fi

    docker cp "$CONTAINER:/pb/pb_data" "$BACKUP_DIR/pb_data_${TIMESTAMP}"
else
    echo "[backup] Copying from volume: $PB_DATA"
    cp -r "$PB_DATA" "$BACKUP_DIR/pb_data_${TIMESTAMP}"
fi

# Compress
cd "$BACKUP_DIR"
tar -czf "pb_data_${TIMESTAMP}.tar.gz" "pb_data_${TIMESTAMP}"
rm -rf "pb_data_${TIMESTAMP}"

echo "[backup] Created: $BACKUP_DIR/pb_data_${TIMESTAMP}.tar.gz"

# Rotate old backups
find "$BACKUP_DIR" -name "pb_data_*.tar.gz" -mtime +${KEEP_DAYS} -delete
REMAINING=$(find "$BACKUP_DIR" -name "pb_data_*.tar.gz" | wc -l)
echo "[backup] Done. $REMAINING backups kept (last ${KEEP_DAYS} days)."
