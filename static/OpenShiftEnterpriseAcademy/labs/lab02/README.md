# Lab 02 — Deploy real da aplicação Flask

Exercício prático para fazer em um CRC real, depois de estudar os capítulos 6 a 8 do treinamento.

## Objetivo

Sair da simulação do navegador e fazer o deploy de verdade de uma aplicação Flask simples no seu cluster local.

## Passo a passo

1. Crie o projeto: `oc new-project tekton-lab`.
2. Crie uma aplicação Flask mínima local (um `app.py` com uma rota `/` respondendo "Hello OpenShift") e um `Dockerfile` simples baseado em `python:3.12-slim`.
3. Publique a imagem no registry interno usando `oc new-build` + `oc start-build`, ou via `oc apply -f` com os manifestos de Deployment/Service/Route explicados no [Capítulo 08](../../chapters/08-deploy-flask.html).
4. Exponha a aplicação e acesse a URL da Route no navegador.

## Critério de conclusão

```bash
oc get deployment,svc,route,pods
```
Todos os objetos devem aparecer com status saudável (`Available`, `Running`), e a Route deve responder no navegador.
