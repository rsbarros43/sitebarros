# Lab 03 — Pipeline CI/CD com Tekton

Exercício prático para fazer em um CRC real, depois de estudar os capítulos 9 e 10 do treinamento.

## Objetivo

Instalar o OpenShift Pipelines (Tekton) via Operator e recriar a pipeline de build+deploy explicada no curso, dessa vez em um cluster real.

## Passo a passo

1. Instale o Operator **Red Hat OpenShift Pipelines** pela console web (menu Operators → OperatorHub).
2. Crie as Tasks `clone-repository`, `build-and-push-image` e `deploy-to-openshift` (ou use as Tasks prontas do catálogo do Tekton Hub).
3. Crie a Pipeline encadeando as três Tasks, como no [Capítulo 09](../../chapters/09-pipelines-tekton.html).
4. Rode uma PipelineRun manual e acompanhe o log com `tkn pipelinerun logs -f`.
5. Configure os Triggers (RBAC, TriggerBinding, TriggerTemplate, EventListener) do [Capítulo 10](../../chapters/10-triggers.html) e exponha o EventListener com `oc port-forward` + ngrok.
6. Faça um push real no seu repositório de teste no GitHub e confirme que uma nova PipelineRun é criada automaticamente.

## Critério de conclusão

```bash
oc get pipelinerun --sort-by=.metadata.creationTimestamp
```
A execução mais recente deve mostrar `Succeeded`, sem você ter rodado nenhum comando manual para dispará-la.
