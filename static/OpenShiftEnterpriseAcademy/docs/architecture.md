# Arquitetura do laboratório

Visão geral de como as peças se conectam neste projeto, do host até a aplicação rodando no cluster.

## Visão geral

```
Host (Linux Mint / macOS / Windows)
   └── CRC / OpenShift Local (VM de 1 node)
         └── Projeto "tekton-lab" (namespace)
               ├── Aplicação Flask
               │     ├── Deployment (mantém os pods rodando)
               │     ├── Service (ClusterIP, acesso interno)
               │     └── Route (acesso externo via HTTPS)
               │
               └── CI/CD com Tekton
                     ├── Tasks (clone-repository, build-and-push-image, deploy-to-openshift)
                     ├── Pipeline (encadeia as Tasks)
                     └── Triggers (RBAC, TriggerBinding, TriggerTemplate, EventListener, Route)
                            └── exposto via ngrok/port-forward para receber o webhook do GitHub
```

## Fluxo de CI/CD ponta a ponta

1. Desenvolvedor faz `git push` no GitHub.
2. O GitHub dispara um **webhook** HTTP para o endpoint público (ngrok, no laboratório local).
3. O **EventListener** do Tekton Triggers recebe a requisição.
4. **TriggerBinding** extrai os dados relevantes do payload (branch, repositório, commit).
5. **TriggerTemplate** usa esses dados para criar uma nova **PipelineRun**.
6. A pipeline executa em sequência: clona o repositório → builda a imagem com Buildah → publica no registry interno → atualiza o Deployment.
7. O usuário acessa a nova versão da aplicação através da **Route**.

## Por que essa arquitetura

Essa é a mesma lógica usada em times de plataforma reais: nada é feito manualmente em produção. Todo o processo é declarativo (YAML versionado no Git) e automatizado — o time só precisa aprovar mudanças no código, e o cluster se encarrega do resto.

Veja o passo a passo completo no [Capítulo 11 — Projeto Final CI/CD](../chapters/11-projeto-final-cicd.html).
