#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"
PORT="${1:-8097}"
echo "============================================================"
echo " DBATOOLKIT v3.2.0 - OCI PORTAL UI"
echo "============================================================"
echo "Diretorio: $DIR"
echo "Acesse: http://localhost:$PORT/?v=320"
echo
python3 -m http.server "$PORT"
