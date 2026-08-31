#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "Checking StrataForge project at $ROOT"
test -f "$ROOT/backend/pom.xml"
test -f "$ROOT/frontend/package.json"
test -f "$ROOT/docker-compose.yml"
test -f "$ROOT/db/schema.sql"
test -f "$ROOT/data/ingest.py"
echo "Project structure OK"
