# Troubleshooting

Guia de referência rápida para os problemas mais comuns do laboratório. Para o passo a passo explicado, veja o [Capítulo 12 — Troubleshooting](../chapters/12-troubleshooting.html).

## CRC não inicia

**Sintoma:** `crc start` falha ou trava em "Starting CRC VM".
**Causas comuns:**
- Virtualização desabilitada na BIOS/UEFI.
- libvirt/KVM mal configurado (Linux) ou permissões insuficientes.
- RAM insuficiente (CRC precisa de pelo menos ~9 GB livres para iniciar).

**Como resolver:**
```
grep -cE 'vmx|svm' /proc/cpuinfo   # deve retornar > 0
crc setup                          # roda novamente a preparação
free -h                            # confirma RAM disponível
```

## ImagePullBackOff

**Sintoma:** o pod da aplicação nunca fica pronto.
**Causa comum:** a imagem ainda não foi publicada no registry interno — normalmente porque a pipeline não rodou ou falhou antes de chegar na etapa de build.
**Como resolver:** confirme que a PipelineRun terminou com `Succeeded` antes de esperar o Deployment funcionar (`oc get pipelinerun`).

## CrashLoopBackOff

**Sintoma:** o pod reinicia repetidamente.
**Causa comum:** erro na própria aplicação — porta errada, dependência faltando, exceção na inicialização.
**Como resolver:**
```
oc logs deployment/flask-app
```

## Route retorna 503

**Sintoma:** a URL da aplicação responde "Application is not available".
**Causa comum:** nenhum pod está `Ready`, ou o Service aponta para o selector errado.
**Como resolver:**
```
oc get pods
oc describe route flask-app
```

## InvalidWorkspaceBindings

**Sintoma:** a PipelineRun falha antes mesmo de começar a primeira Task.
**Causa comum:** a Pipeline exige um workspace obrigatório, mas o PipelineRun não enviou o binding correto.
**Como resolver:** revise o `manual-pipelinerun.yaml` e confirme que o nome do workspace bate com o definido na Pipeline.

## Webhook não dispara a pipeline

**Sintoma:** push no GitHub não gera uma nova PipelineRun.
**Causa comum:** a URL do túnel ngrok expirou/mudou e o webhook no GitHub ainda aponta para a antiga.
**Como resolver:** gere uma nova URL (`ngrok http 8080`), atualize o webhook no GitHub e confirme que o EventListener está `Running`.

## Regra geral de diagnóstico

Para qualquer problema não listado acima, comece sempre por aqui:
```
oc get events --sort-by=.lastTimestamp
oc describe <tipo> <nome>
```
Esses dois comandos resolvem a maioria dos mistérios em um cluster Kubernetes/OpenShift.
