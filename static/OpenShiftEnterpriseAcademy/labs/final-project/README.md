# Projeto Final — Pipeline CI/CD completa, ponta a ponta

Este é o exercício de consolidação de todo o treinamento, equivalente ao [Capítulo 11](../../chapters/11-projeto-final-cicd.html), mas em um cluster CRC real em vez do simulador do navegador.

## Pré-requisitos

Ter concluído os Labs 01, 02 e 03 com sucesso.

## Objetivo

Reproduzir, do zero e em um cluster real, o fluxo completo:

```
GitHub Push → Webhook → EventListener → PipelineRun → Build → Deploy → Route atualizada
```

## Checklist de aceite

- [ ] Deployment, Service e Route da aplicação aplicados e saudáveis.
- [ ] Tasks e Pipeline do Tekton publicadas no namespace.
- [ ] Execução manual da pipeline concluída com `Succeeded`.
- [ ] RBAC, TriggerBinding, TriggerTemplate e EventListener aplicados.
- [ ] EventListener exposto publicamente (Route ou túnel) e alcançável pelo GitHub.
- [ ] Um push real no repositório dispara uma nova PipelineRun automaticamente, sem intervenção manual.
- [ ] A aplicação atualizada está acessível pela Route após o deploy automático.

## Por que isso importa

Esse é o tipo de fluxo que times de plataforma mantêm em produção. Completar esse laboratório em um cluster real — não só no simulador do navegador — é a melhor forma de comprovar, na prática, que os conceitos do curso foram realmente absorvidos.
