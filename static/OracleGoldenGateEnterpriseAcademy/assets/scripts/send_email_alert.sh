#!/bin/bash
# ============================================================================
# send_email_alert.sh — Envia um e-mail de alerta quando processos com
# problema (STOPPED/ABENDED) são encontrados. Usa o comando `mail`/`mailx`
# padrão do sistema operacional (configure um MTA local como Postfix/
# sSMTP antes de usar em produção).
#
# Uso: ./send_email_alert.sh <deployment_url> <deployment_name> <usuario> <destinatario@empresa.com>
# Sugestão de crontab: */10 * * * * /caminho/send_email_alert.sh ... 2>&1
# ============================================================================
set -euo pipefail

DEPLOY_URL="${1:?Informe a URL do deployment}"
DEPLOY_NAME="${2:?Informe o nome do deployment}"
ADMIN_USER="${3:?Informe o usuário administrativo}"
DEST_EMAIL="${4:?Informe o e-mail de destino}"

OUTPUT=$(adminclient <<EOF
CONNECT ${DEPLOY_URL} DEPLOYMENT ${DEPLOY_NAME} AS ${ADMIN_USER}
INFO ALL
EOF
)

PROBLEMAS=$(echo "$OUTPUT" | grep -E "STOPPED|ABENDED" || true)

if [ -n "$PROBLEMAS" ]; then
  SUBJECT="[ALERTA] GoldenGate ${DEPLOY_NAME} — processo(s) com problema"
  BODY="Processos fora do estado RUNNING detectados em ${DEPLOY_NAME}:

${PROBLEMAS}

Saída completa do INFO ALL:
${OUTPUT}

--
Enviado automaticamente por send_email_alert.sh em $(date '+%Y-%m-%d %H:%M:%S')"

  echo "$BODY" | mail -s "$SUBJECT" "$DEST_EMAIL"
  echo "E-mail de alerta enviado para $DEST_EMAIL"
else
  echo "Nenhum problema encontrado — nenhum e-mail enviado."
fi
