#!/bin/bash
# ============================================================================
# check_disk_space.sh — Verifica o espaço livre nos filesystems críticos do
# GoldenGate (OGG_VAR_HOME e diretório de trail files), alertando abaixo
# do limite configurado. Causa mais comum e mais simples de paradas
# inesperadas de Extract/Replicat.
#
# Uso: ./check_disk_space.sh [limite_percentual_alerta]
# Exemplo: ./check_disk_space.sh 85
# ============================================================================
set -euo pipefail

THRESHOLD="${1:-85}"
PATHS_TO_CHECK=("${OGG_VAR_HOME:-/u02/ogg/var}" "${OGG_ETC_HOME:-/u02/ogg/etc}")

echo "== Verificação de espaço em disco (alerta acima de ${THRESHOLD}%) =="

for p in "${PATHS_TO_CHECK[@]}"; do
  if [ -d "$p" ]; then
    USAGE=$(df -P "$p" | awk 'NR==2 {gsub("%","",$5); print $5}')
    echo "  $p -> ${USAGE}% em uso"
    if [ "$USAGE" -ge "$THRESHOLD" ]; then
      echo "  ⚠ ALERTA: $p está em ${USAGE}% de uso (limite ${THRESHOLD}%)"
    fi
  else
    echo "  (diretório não encontrado, pulando: $p)"
  fi
done

echo "== Verificação concluída =="
