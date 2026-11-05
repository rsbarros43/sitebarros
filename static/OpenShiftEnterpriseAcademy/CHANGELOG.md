# CHANGELOG

## v2.7.1 - Ajuste final de topbar

- Removido o badge de versão "v2.3.0" do topbar, ao lado do título do capítulo, em todas as 15 páginas.

## v2.7.0 - Visualizações nos capítulos 8, 9 e 11 (versão para publicação)

- Capítulo 8: ao confirmar o deploy, abre uma janela de navegador mostrando a aplicação Flask rodando de verdade na Route ("Hello, OpenShift!").
- Capítulo 9: ao criar a PipelineRun manual, abre um painel com a visualização do pipeline — as 3 Tasks (clone-repository, build-and-push-image, deploy-to-openshift) animam em sequência de pendente → executando → sucesso, como na console real do OpenShift Pipelines.
- Capítulo 11: ao validar o disparo automático, abre uma Topology view consolidada mostrando Pipeline → Deployment → Pod → Service → Route conectados e validados em sequência, fechando o curso com uma visão consolidada do que foi construído.
- Corrigido bug real encontrado durante esta atualização: os passos 2, 3 e 4 do laboratório do Capítulo 8 estavam duplicados desde uma edição anterior (Service e Route apareciam duas vezes na lista).
- Animação de "carregando" dos mockups generalizada para funcionar com qualquer tipo de conteúdo (antes só funcionava com a console web).

## v2.6.1 - Tela de login no mockup da console

- "Abrir console" agora mostra primeiro uma tela de login realista (logo, kube:admin, campos de usuário/senha) em vez de ir direto para o painel.
- "Executar oc login" faz a transição da tela de login para o painel do projeto, com o badge de usuário e toast de confirmação.
- O botão "Log in" dentro do próprio mockup também funciona, disparando a mesma transição.

## v2.6.0 - Mockup visual da console web do OpenShift

- Novo recurso no Capítulo 4: ao clicar em "Abrir console", uma janela de navegador simulada aparece abaixo do terminal, mostrando a console web do OpenShift (topbar, menu lateral, projeto "tekton-lab" com cards de Deployment/Pod/Service/Route).
- "Executar oc login" agora sincroniza visualmente com o mockup: o badge de usuário muda de "Não autenticado" para "kube:admin" e mostra um toast de confirmação.
- "Validar usuário" mostra um toast confirmando o retorno do `oc whoami`.
- Corrigido um erro de sintaxe introduzido durante o desenvolvimento deste recurso (função _fallbackCopy) antes da entrega — detectado e corrigido em teste automatizado.

## v2.5.0 - Polimento final para publicação

- Adicionadas meta tags Open Graph e Twitter Card em index.html, com imagem de preview gerada (assets/images/social-preview.png, 1200x630) — necessário ajustar a URL da imagem para o domínio final após publicar.
- Adicionado aviso visível em todos os terminais simulados: "Ambiente simulado: os comandos não se conectam a um cluster real."
- docs/architecture.md, commands.md, troubleshooting.md e installation.md preenchidos com conteúdo real de referência (antes eram um placeholder de uma linha).
- labs/lab01, lab02, lab03 e final-project preenchidos com roteiros reais de prática em CRC de verdade, complementando a simulação do navegador (antes diziam apenas "reservado para próximas fases").

## v2.4.2 - Revisão completa do projeto (fim a fim)

- Capítulo 5: adicionado resumo rápido reforçando cluster, node, project/namespace, pod, deployment, service e route antes da prática.
- Capítulo 11: adicionada explicação de "o que é o Buildah", citado no fluxo mas nunca explicado.
- Revisão de ponta a ponta confirmando que todos os 14 capítulos + dashboard carregam sem erro de JavaScript e que nenhum comando do terminal ficou sem mapeamento.

## v2.4.1 - Mais didático para iniciantes (feedback: "se for para leigos, seja mais detalhado")

- Capítulo 1 reescrito: agora explica o que é container, o que é Kubernetes, o que é cluster/node e onde o OpenShift entra, em linguagem simples, antes de qualquer comando.
- Capítulo 8: adicionada explicação de "o que é uma imagem de container" e "o que é YAML" antes dos manifestos.
- Capítulo 9: adicionada explicação de "o que é CI/CD" em linguagem simples antes de Task/Pipeline/PipelineRun.
- Capítulo 10: adicionada explicação de "o que é um webhook" e por que ele existe.

## v2.4.0 - Feedback de revisão técnica (Leonardo Alves de Araujo, especialista OpenShift)

- Layout dos capítulos reorganizado: material de estudo 100% na coluna esquerda, terminal simulado 100% na coluna direita (fixo/sticky ao rolar a página).
- Corrigido bug no dashboard: card "Resumo do seu progresso" mostrava "Em andamento: 1" fixo, mesmo com 100% concluído — número nunca era atualizado pelo código. Removido.
- Capítulo 2: título e conteúdo deixaram de ser específicos de Linux Mint — agora cobre explicitamente suporte a macOS (incluindo Apple Silicon) e Windows.
- Capítulo 2: nova seção comparando `oc` e `kubectl`, explicando quando usar cada um.
- Capítulo 3: adicionado o link oficial de download do CRC/OpenShift Local (console.redhat.com/openshift/create/local) e detalhamento do processo de setup por sistema operacional.
- Capítulo 6: nova seção com as abreviações mais usadas dos objetos (po, svc, deploy, rs, rc, ns, cm, sa) e como descobrir todas via `oc api-resources`.
- Capítulo 7: adicionados ConfigMap, Secret e Operator ao mapa mental de objetos do cluster, e nova seção explicando os tipos de Service (ClusterIP, NodePort, LoadBalancer).
- Capítulo 8: adicionada explicação campo a campo do manifesto de Deployment, além dos manifestos completos de Service e Route (que eram citados mas nunca mostrados), com laboratório guiado aplicando os três objetos.
- Capítulo 10: nova seção explicando o `oc port-forward`, usado no capítulo 11 mas nunca detalhado antes.

## v2.3.0 - Trilha completa

- Desenvolvido o capítulo 11 - Projeto Final CI/CD (laboratório ponta a ponta reunindo deploy, Tekton e Triggers).
- Desenvolvido o capítulo 12 - Troubleshooting (6 cenários de erro comuns com causa/solução e novos comandos de diagnóstico no simulador).
- Implementado o quiz do capítulo 13: 10 perguntas de múltipla escolha, correção automática, explicações por pergunta e aprovação a partir de 70%.
- Implementado o certificado do capítulo 14: geração automática com nome do aluno, data e código de verificação, liberado após aprovação no quiz, com opção de impressão/PDF.
- Corrigido aviso desatualizado no dashboard que ainda mencionava "capítulos 1 a 5 desenvolvidos".
- Atualizado badge de versão em todas as páginas para v2.3.0.


## v2.2.1

- Mantido o layout visual aprovado da V1.2.0.
- Desenvolvido o capítulo 06 - Gerenciando projetos.
- Desenvolvido o capítulo 07 - Explorando o cluster.
- Desenvolvido o capítulo 08 - Deploy da aplicação Flask.
- Desenvolvido o capítulo 09 - Pipelines Tekton.
- Desenvolvido o capítulo 10 - Tekton Triggers e GitHub Webhook.
- Expandido o simulador de terminal com comandos `oc`, `crc`, `tkn`, Tekton e ngrok.
- Atualizado README.


## v2.2.1 - Correção dos botões e terminal
- Corrigidos botões Executar dos capítulos 6 a 10.
- Corrigidos botões Copiar dos capítulos 6 a 10.
- Corrigidos botões rápidos do terminal.
- Adicionado fallback para copiar em páginas abertas via file://.


## v2.2.2 - Terminal Input Fix

- Criada linha editável para digitar/colar comandos no terminal.
- Comandos rápidos passam a preencher a linha do terminal.
- Blocos de comando podem ser clicados para enviar o comando para a linha.
- Botões Copiar removidos dos laboratórios.


## v2.2.3 - Copy to Terminal Input

- Reintroduzido botão Copiar para preencher a linha do terminal.
- Corrigido botão Executar duplicado.
- Mantido terminal interativo com Enter.
