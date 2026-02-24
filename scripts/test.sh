#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Palmier — Run backend tests
#
# Usage:
#   ./scripts/test.sh              # Run all tests
#   ./scripts/test.sh --cov        # Run with coverage report
#   ./scripts/test.sh -k test_name # Run specific test
# ─────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_DIR/backend"

cd "$BACKEND_DIR"

if [[ "${1:-}" == "--cov" ]]; then
    shift
    python -m pytest tests/ -v --cov=app --cov-report=term-missing "$@"
else
    python -m pytest tests/ -v "$@"
fi
