#!/bin/bash
# ============================================================================
# daily_health_summary.sh — Gera um resumo diário consolidado (status de
# processos + espaço em disco + serviço systemd), útil para rodar via cron
# no início do dia e revisar rapidamente a saúde do ambiente.
#
# Uso: ./daily_health_summary.sh <deployment_url> <deployment_name> <usuario>
# Sugestão de crontab: 0 7 * * * /caminho/daily_health_summary.sh ... >> /var/log/ogg_daily.log 2>&1
# ============================================================================
set -euo pipefail

DEPLOY_URL="${1:?Informe a URL do deployment}"
DEPLOY_NAME="${2:?Informe o nome do deployment}"
ADMIN_USER="${3:?Informe o usuário administrativo}"

echo "=================================================================="
echo " RESUMO DIÁRIO DE SAÚDE — Oracle GoldenGate — $(date '+%Y-%m-%d %H:%M')"
echo "=================================================================="

echo ""
echo "--- 1. Serviço systemd ---"
systemctl status OracleGoldenGate --no-pager || echo "(serviço não encontrado neste host)"

echo ""
echo "--- 2. Espaço em disco ---"
df -h "${OGG_VAR_HOME:-/u02/ogg/var}" 2>/dev/null || echo "(diretório não encontrado)"

echo ""
echo "--- 3. Status dos processos ---"
adminclient <<EOF
CONNECT ${DEPLOY_URL} DEPLOYMENT ${DEPLOY_NAME} AS ${ADMIN_USER}
INFO ALL
EOF

echo ""
echo "=================================================================="
echo " Fim do resumo. Revise processos ABENDED ou STOPPED acima."
echo "=================================================================="
