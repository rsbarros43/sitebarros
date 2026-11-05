# Oracle GoldenGate 26ai Enterprise Academy v1.5.5

Plataforma interativa desenvolvida por Renato Barros.

## Recursos
- Identificação obrigatória do aluno para liberar os módulos
- 12 módulos técnicos ricos em conteúdo
- Capas extraídas do material original
- Mais de 185 comandos e verificações
- Laboratórios guiados passo a passo com **capturas de tela reais** do instalador, do OGGCA e da console web (Módulos 02, 05, 07, 08 e 10)
- Roteiros de linha de comando completos via Admin Client (Módulos 06 e 07), incluindo Distribution Path, WSS e replicação heterogênea Oracle → MySQL/PostgreSQL
- **Glossário técnico pesquisável** com 46 termos, navegação direta para o módulo correspondente
- **Central de Links** com recursos oficiais da Oracle (documentação, REST API, tutoriais, certificação, MCP)
- **Kit de scripts para download** (monitoramento de lag, disco, processos parados, heartbeat, resumo diário)
- **Módulo "IA & MCP"** — como assistentes/agentes de IA operam o GoldenGate via Model Context Protocol, com base no MCP Server open-source oficial da Oracle (maio/2026)
- Quiz ampliado para 25 perguntas, cobrindo os comandos novos da v1.3.0
- Terminal flutuante com execução simulada
- Progresso salvo no navegador
- Quiz final e certificado
- PDFs originais na pasta `docs`
- Compatível com GitHub Pages

## Execução
Abra `index.html` no navegador ou publique todo o diretório em um servidor estático.

> Os comandos são apresentados para estudo. Valide versões, caminhos, privilégios e políticas antes de executar em ambientes reais.


## Ajustes v1.5.5
- **Correção de bug real em telas de celular (≤680px):** o menu de navegação estava configurado (desde a versão original v1.2.1) para esconder todos os botões exceto "Aluno" nesse tamanho de tela. Com o crescimento do menu para 8 itens (Formação, Quiz, Glossário, Recursos, Scripts, IA & MCP, Certificado, Aluno), isso tornava a maior parte do site inacessível por navegação direta no celular. Agora o menu vira uma segunda linha com rolagem horizontal, mantendo todos os itens visíveis e clicáveis em qualquer largura de tela.

## Ajustes v1.5.4
- Adicionado o logo "Oracle GoldenGate 26ai" (versão escura) no card "Formação completa" do dashboard, usando `mix-blend-mode: screen` em CSS para fundir o fundo escuro do logo com o fundo do card, sem retângulo visível.

## Ajustes v1.5.3
- Adicionado o logo oficial "Oracle GoldenGate 26ai" (ponte + nuvem) no topo do Certificado de Conclusão, substituindo o texto simples anterior — testado visualmente antes de aplicar (o fundo branco do logo só combina em áreas de fundo claro, como o certificado; não no dashboard, que é escuro).

## Ajustes v1.5.2
- Removido o número de versão do cabeçalho visível (mantido apenas no `<title>` da aba do navegador).
- O logo "GG" no cabeçalho agora é clicável e leva de volta ao Dashboard, em qualquer página do site.

## Ajustes v1.5.1
- Reescritos os dois avisos (banner "ai-warning") que soavam ambíguos: o da página Scripts agora deixa claro que os scripts são templates reais e utilizáveis em produção (não apenas educacionais), listando o que precisa ser adaptado. O da página IA & MCP agora explica melhor o que "não certificado pela Oracle" significa na prática (funcional e real, mas sem linha de suporte oficial em caso de falha), em vez de soar como uma proibição de uso.

## Ajustes v1.5.0
- **Kit de scripts ampliado de 5 para 10 scripts**, organizado em 4 categorias (Monitoramento, Relatórios, Notificação, Backup e Housekeeping): novos scripts `generate_html_report.sh` (relatório HTML navegável), `send_email_alert.sh` (alerta por e-mail via mail/mailx), `notify_webhook.sh` (notificação Slack/Teams/Discord via webhook), `backup_parameter_files.sh` (backup versionado de .prm com housekeeping automático) e `weekly_growth_report.sql` (relatório de capacidade semanal).
- **Terminal interativo com "Simular execução"**: cada um dos 10 scripts agora tem um botão que exibe, no terminal flutuante já existente no site, um exemplo ilustrativo e realista da saída daquele script — sem precisar de ambiente real.
- **Diagrama de arquitetura MCP** na página "IA & MCP": ilustração original, fiel à arquitetura descrita no blog oficial da Oracle (maio/2026), mostrando o fluxo Assistente de IA → MCP Server → GoldenGate REST API → Microservices.

## Ajustes v1.4.0
- **Glossário Técnico** (novo item de menu): 46 termos essenciais, com busca em tempo real e clique direto para o módulo correspondente.
- **Central de Links / Recursos Oficiais** (novo item de menu): links verificados para documentação 26ai, REST API, tutoriais, certificação Oracle University, blog oficial e o MCP Server de GoldenGate.
- **Scripts de Monitoramento** (novo item de menu): 5 scripts reais para download (`check_lag.sh`, `find_stopped_processes.sh`, `check_disk_space.sh`, `heartbeat_report.sql`, `daily_health_summary.sh`), prontos para adaptar e usar em cron/pipelines de monitoramento.
- **IA & MCP** (novo item de menu): módulo dedicado explicando o Model Context Protocol e o Oracle GoldenGate MCP Server open-source (anunciado oficialmente pela Oracle em maio/2026) — ferramentas disponíveis, exemplos de prompts, instalação e boas práticas de segurança, com aviso claro de que é um recurso não certificado para produção.
- **Quiz ampliado de 10 para 25 perguntas**, cobrindo os 46 comandos adicionados na v1.3.0 e o novo conteúdo de IA/MCP.
- Correção de layout: botão "← Dashboard" agora fica em linha própria acima do rótulo "MÓDULO XX", eliminando o espaçamento apertado entre os dois elementos.

## Ajustes v1.3.0
- Adicionados **46 novos comandos técnicos** extraídos diretamente das apostilas originais e do Caderno de Exercícios oficial (total salta de 133 para 185 comandos), incluindo itens que faltavam no material anterior: roles nativas `OGG_CAPTURE`/`OGG_APPLY`/`OGG_APPLY_PROCREP` do Oracle 26ai, ativação de ARCHIVELOG, parâmetros de CDC do PostgreSQL e MySQL (wal_level, REPLICA IDENTITY, binlog_row_metadata, GTID), geração de Root CA/mTLS, `CONNECT`/`REGISTER EXTRACT`/`ALTER EXTRACT BEGIN` via Admin Client, `ADD DISTPATH`/`ADD PATH`/`START ... ATCSN` para replicação em rede e heterogênea, script oficial `ogghc_install/run/deinstall.sql` do Healthcheck, e tuning avançado (`CACHEDIRECTORY`, `CHECKPOINTSECS`, `GROUPTRANSOPS`, `PCTFREE` em RAC).
- Adicionados **laboratórios guiados passo a passo** em 8 módulos (02 a 08, 10), com instruções numeradas derivadas do Caderno de Exercícios oficial.
- Adicionadas **20 capturas de tela reais** (instalador OUI, assistente OGGCA, console web do Administration Service, wizard de Add Extract/Add Replicat, tela de conexão de banco) nos Módulos 02, 05, 07, 08 e 10, em `assets/labs/`.
- Contador de comandos do dashboard atualizado automaticamente para refletir o novo total.

## Ajustes v1.2.1
- Remoção da carga horária fixa.
- Barra geral de progresso animada.
- Títulos principais ajustados para permanecerem na mesma linha em telas amplas.
