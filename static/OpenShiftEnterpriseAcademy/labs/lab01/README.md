# Lab 01 — Setup e primeiro contato com o cluster

Exercício prático para fazer em um CRC real, depois de estudar os capítulos 1 a 5 do treinamento.

## Objetivo

Instalar o OpenShift Local do zero e validar o acesso via CLI e console web.

## Passo a passo

1. Siga [docs/installation.md](../../docs/installation.md) para instalar o CRC no seu sistema operacional.
2. Inicie o cluster: `crc start -p pull-secret.txt`.
3. Configure o `oc` no PATH: `eval $(crc oc-env)`.
4. Faça login: `oc login -u kubeadmin -p $(crc console --credentials | grep kubeadmin) https://api.crc.testing:6443`.
5. Abra a console web com `crc console` e explore o menu lateral.

## Critério de conclusão

Rode os três comandos abaixo sem erro:
```bash
crc status
oc whoami
oc get projects
```

Se todos responderem corretamente, o ambiente está pronto para o Lab 02.
