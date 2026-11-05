#!/bin/bash
# ============================================================================
# notify_webhook.sh — Envia uma notificação para um webhook genérico
# (Slack, Microsoft Teams, Discord ou qualquer endpoint que aceite JSON)
# quando processos com problema são encontrados. Mais rápido que e-mail
# para equipes que monitoram um canal de operações em tempo real.
#
# Uso: ./notify_webhook.sh <deployment_url> <deployment_name> <usuario> <webhook_url>
# Exemplo Slack: https://hooks.slack.com/services/XXX/YYY/ZZZ
# ============================================================================
set -euo pipefail

DEPLOY_URL="${1:?Informe a URL do deployment}"
DEPLOY_NAME="${2:?Informe o nome do deployment}"
ADMIN_USER="${3:?Informe o usuário administrativo}"
WEBHOOK_URL="${4:?Informe a URL do webhook}"

OUTPUT=$(adminclient <<EOF
CONNECT ${DEPLOY_URL} DEPLOYMENT ${DEPLOY_NAME} AS ${ADMIN_USER}
INFO ALL
EOF
)

PROBLEMAS=$(echo "$OUTPUT" | grep -E "STOPPED|ABENDED" || true)

if [ -n "$PROBLEMAS" ]; then
  TIMESTAMP=$(date '+%H:%M:%S')
  TEXT="ALERTA GoldenGate ${DEPLOY_NAME}: processo(s) fora do estado RUNNING detectado(s) as ${TIMESTAMP}."

  # Escapa quebras de linha e aspas para um payload JSON valido
  ESCAPED=$(echo "$PROBLEMAS" | sed ':a;N;$!ba;s/\n/\\n/g; s/"/\\"/g')
  PAYLOAD="{\"text\": \"${TEXT}\n\n${ESCAPED}\"}"

  curl -s -X POST -H 'Content-Type: application/json' \
    -d "$PAYLOAD" \
    "$WEBHOOK_URL"

  echo ""
  echo "Notificacao enviada ao webhook."
else
  echo "Nenhum problema encontrado — nenhuma notificacao enviada."
fi
