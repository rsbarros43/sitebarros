#!/bin/bash
# ============================================================================
# backup_parameter_files.sh — Faz backup versionado (com timestamp) dos
# arquivos de parâmetros (.prm) e credenciais de referência antes de uma
# mudança planejada — prática essencial de controle de mudanças.
#
# Uso: ./backup_parameter_files.sh [diretorio_origem] [diretorio_destino]
# Sugestão de crontab: 0 2 * * * /caminho/backup_parameter_files.sh
# ============================================================================
set -euo pipefail

SRC_DIR="${1:-${OGG_ETC_HOME:-/u02/ogg/etc}}"
DEST_DIR="${2:-/u02/ogg/backups}"
STAMP=$(date +%Y%m%d_%H%M%S)
TARGET="${DEST_DIR}/params_${STAMP}"

mkdir -p "$TARGET"

if [ -d "$SRC_DIR" ]; then
  find "$SRC_DIR" -name "*.prm" -exec cp {} "$TARGET/" \;
  COUNT=$(find "$TARGET" -name "*.prm" | wc -l)
  echo "Backup concluído: $COUNT arquivo(s) .prm copiados para $TARGET"

  # Mantém apenas os 30 backups mais recentes (housekeeping)
  ls -dt "${DEST_DIR}"/params_* 2>/dev/null | tail -n +31 | xargs -r rm -rf
  echo "Housekeeping: mantidos os 30 backups mais recentes em ${DEST_DIR}"
else
  echo "Diretório de origem não encontrado: $SRC_DIR" >&2
  exit 1
fi
