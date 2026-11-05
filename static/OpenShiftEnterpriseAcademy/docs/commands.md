# Referência rápida de comandos

Cola dos comandos `oc` e `crc` mais usados ao longo do laboratório, organizados por assunto.

## Gerenciando o CRC (OpenShift Local)

| Comando | O que faz |
|---|---|
| `crc setup` | Prepara o host (libvirt, rede, dependências) para rodar o CRC. |
| `crc start -p pull-secret.txt` | Inicia o cluster local usando o pull secret. |
| `crc stop` | Pausa o cluster, preservando o estado. |
| `crc status` | Mostra se o cluster está rodando, uso de CPU/RAM/disco. |
| `crc console` | Abre a console web do OpenShift no navegador. |
| `crc console --credentials` | Mostra o usuário e senha do `kubeadmin`. |
| `crc delete` | Remove a VM do cluster local por completo. |

## Autenticação e contexto

| Comando | O que faz |
|---|---|
| `oc login -u kubeadmin -p <senha> https://api.crc.testing:6443` | Autentica no cluster como administrador. |
| `oc whoami` | Mostra o usuário autenticado no momento. |
| `oc project <nome>` | Muda o projeto/namespace ativo. |
| `oc new-project <nome>` | Cria um novo projeto. |

## Objetos do dia a dia (com abreviação)

| Comando completo | Abreviado | O que lista |
|---|---|---|
| `oc get pods` | `oc get po` | Pods em execução |
| `oc get services` | `oc get svc` | Services do projeto |
| `oc get deployments` | `oc get deploy` | Deployments |
| `oc get routes` | — | Routes (não tem abreviação curta) |
| `oc get configmaps` | `oc get cm` | ConfigMaps |
| `oc get namespaces` | `oc get ns` | Namespaces/Projects |

Para ver a lista completa de abreviações do seu cluster: `oc api-resources`.

## Deploy e diagnóstico

| Comando | O que faz |
|---|---|
| `oc apply -f arquivo.yaml` | Aplica (cria ou atualiza) um manifesto YAML. |
| `oc get deployment,svc,route,pods` | Visão consolidada dos principais objetos da aplicação. |
| `oc logs deployment/<nome>` | Mostra a saída/erro da aplicação. |
| `oc describe pod <nome>` | Detalha eventos, condições e configuração de um pod. |
| `oc describe route <nome>` | Detalha host, TLS e service associado de uma Route. |
| `oc get events --sort-by=.lastTimestamp` | Histórico de eventos do namespace, do mais recente pro mais antigo. |
| `oc port-forward svc/<nome> <porta-local>:<porta-service>` | Cria um túnel temporário até um Service dentro do cluster. |

## Tekton (CI/CD)

| Comando | O que faz |
|---|---|
| `tkn pipeline list` | Lista as pipelines do namespace. |
| `oc get pipelinerun --sort-by=.metadata.creationTimestamp` | Lista execuções da pipeline, da mais antiga pra mais recente. |
| `tkn pipelinerun logs <nome> -f` | Acompanha o log de uma execução em tempo real. |
| `oc get eventlistener,triggerbinding,triggertemplate,route` | Verifica se os Triggers estão configurados corretamente. |

Veja os comandos em contexto, com explicação passo a passo, nos [14 capítulos do treinamento](../index.html).
