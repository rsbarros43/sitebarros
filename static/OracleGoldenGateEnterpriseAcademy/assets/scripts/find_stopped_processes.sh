#!/bin/bash
# ============================================================================
# find_stopped_processes.sh — Consulta rapidamente processos que não estão
# RUNNING (STOPPED ou ABENDED), ideal para integração com cron/Zabbix/
# Prometheus. Retorna código de saída != 0 se encontrar algum problema,
# facilitando o uso em pipelines de monitoramento.
#
# Uso: ./find_stopped_processes.sh <deployment_url> <deployment_name> <usuario>
# ============================================================================
set -euo pipefail

DEPLOY_URL="${1:?Informe a URL do deployment}"
DEPLOY_NAME="${2:?Informe o nome do deployment}"
ADMIN_USER="${3:?Informe o usuário administrativo}"

OUTPUT=$(adminclient <<EOF
CONNECT ${DEPLOY_URL} DEPLOYMENT ${DEPLOY_NAME} AS ${ADMIN_USER}
INFO ALL
EOF
)

echo "$OUTPUT"

PROBLEMAS=$(echo "$OUTPUT" | grep -E "STOPPED|ABENDED" || true)

if [ -n "$PROBLEMAS" ]; then
  echo ""
  echo "⚠ Processos com problema encontrados:"
  echo "$PROBLEMAS"
  exit 1
else
  echo ""
  echo "✔ Todos os processos estão RUNNING."
  exit 0
fi
