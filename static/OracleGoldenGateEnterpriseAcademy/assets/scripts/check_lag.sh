#!/bin/bash
# ============================================================================
# check_lag.sh — Verifica o LAG de todos os Extracts e Replicats via
# Admin Client, alertando quando o atraso ultrapassa o limite definido.
#
# Uso: ./check_lag.sh <deployment_url> <deployment_name> <usuario> <limite_segundos>
# Exemplo: ./check_lag.sh http://192.168.56.110:9001 oracle_deploy srv_manager 300
#
# Requisitos: Admin Client (adminclient) no PATH, acesso ao deployment.
# ============================================================================
set -euo pipefail

DEPLOY_URL="${1:?Informe a URL do deployment}"
DEPLOY_NAME="${2:?Informe o nome do deployment}"
ADMIN_USER="${3:?Informe o usuário administrativo}"
LAG_LIMIT="${4:-300}"   # segundos, padrão 5 minutos

echo "== Verificando LAG (limite: ${LAG_LIMIT}s) em ${DEPLOY_NAME} =="

adminclient <<EOF | tee /tmp/lag_report_$$.txt
CONNECT ${DEPLOY_URL} DEPLOYMENT ${DEPLOY_NAME} AS ${ADMIN_USER}
INFO ALL
EOF

# Extrai processos e alerta os que excedem o limite (ajuste o parsing
# conforme o formato de saída da sua versão do Admin Client).
awk -v limit="$LAG_LIMIT" '
  /EXTRACT|REPLICAT/ { proc=$0 }
  /Lag at Chkpt/ {
    gsub(/[^0-9:]/,"",$0)
    split($0,t,":")
    secs = t[1]*3600 + t[2]*60 + t[3]
    if (secs > limit) {
      print "ALERTA: " proc " com lag de " secs "s (limite " limit "s)"
    }
  }
' /tmp/lag_report_$$.txt

rm -f /tmp/lag_report_$$.txt
echo "== Verificação concluída =="
