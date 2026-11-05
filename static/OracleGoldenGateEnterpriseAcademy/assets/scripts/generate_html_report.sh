#!/bin/bash
# ============================================================================
# generate_html_report.sh — Gera um relatório HTML consolidado do ambiente
# (processos, lag, disco e serviço) pronto para anexar em e-mail ou publicar
# em um servidor web interno. Reaproveita as mesmas fontes de dados do
# daily_health_summary.sh, mas em formato navegável.
#
# Uso: ./generate_html_report.sh <deployment_url> <deployment_name> <usuario> [saida.html]
# ============================================================================
set -euo pipefail

DEPLOY_URL="${1:?Informe a URL do deployment}"
DEPLOY_NAME="${2:?Informe o nome do deployment}"
ADMIN_USER="${3:?Informe o usuário administrativo}"
OUT="${4:-/tmp/ogg_report_$(date +%Y%m%d_%H%M).html}"

INFO_ALL=$(adminclient <<EOF
CONNECT ${DEPLOY_URL} DEPLOYMENT ${DEPLOY_NAME} AS ${ADMIN_USER}
INFO ALL
EOF
)
DISK=$(df -h "${OGG_VAR_HOME:-/u02/ogg/var}" 2>/dev/null || echo "N/A")
SVC=$(systemctl is-active OracleGoldenGate 2>/dev/null || echo "desconhecido")

cat > "$OUT" <<HTML
<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>Relatório GoldenGate — $(date '+%d/%m/%Y %H:%M')</title>
<style>
body{font-family:Arial,sans-serif;background:#0b1a26;color:#e8f0f6;padding:24px}
h1{color:#ffaf40}
pre{background:#08131e;border:1px solid #1c3548;border-radius:8px;padding:14px;overflow-x:auto}
.badge{display:inline-block;padding:4px 10px;border-radius:6px;font-weight:bold}
.ok{background:#1f6f4a}.warn{background:#8a4b12}
</style></head><body>
<h1>Relatório de Saúde — Oracle GoldenGate</h1>
<p>Gerado em $(date '+%Y-%m-%d %H:%M:%S') | Deployment: ${DEPLOY_NAME}</p>
<p>Serviço systemd: <span class="badge $( [ "$SVC" = "active" ] && echo ok || echo warn )">${SVC}</span></p>
<h3>Disco (OGG_VAR_HOME)</h3>
<pre>${DISK}</pre>
<h3>Status dos processos (INFO ALL)</h3>
<pre>${INFO_ALL}</pre>
</body></html>
HTML

echo "Relatório gerado em: $OUT"
