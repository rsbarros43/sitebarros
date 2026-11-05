# Imperva Data Security Academy — Enterprise Edition v3.0.2 (Final Release)

Plataforma web educacional e interativa para demonstração de conceitos de **Imperva Data Security**, **Database Activity Monitoring**, **Oracle Database** e **Microsoft SQL Server**.

> Este projeto é independente, educacional e demonstrativo. Não substitui documentação, treinamento, software, licença ou suporte oficial da Imperva/Thales.

## Acesso rápido

Após publicar no GitHub Pages:

```text
https://rsbarros43.github.io/ImpervaDataSecurityAcademy/
```

## Principais centros

- Dashboard executivo e progresso da Academy.
- 20 módulos com conteúdo, simulações e validação.
- Architecture Center interativo e live data flow.
- Oracle Lab e SQL Server Lab.
- Policy Management Center.
- SOC Investigation Center.
- Documentation Center com guias operacionais.
- Official Resources com links oficiais verificados.
- Downloads Center com fluxo de acesso autorizado.
- Installation Center com 12 etapas guiadas.
- Training Center com trilhas e catálogo oficial.
- Live Monitoring, Reports Center e Demo Scenarios.
- Terminal educacional, quiz e certificado.

## Installation Center

A implantação didática cobre:

1. Planning
2. Prerequisites
3. Architecture
4. Management Server
5. Gateway
6. Agents
7. Oracle Integration
8. SQL Server Integration
9. Policies
10. Data Classification
11. Validation
12. Troubleshooting

Os comandos e validações são simulados. Consulte a documentação oficial da versão licenciada para procedimentos reais.

## Execução local

```bash
python3 -m http.server 8080
```

Acesse `http://localhost:8080`.

## GitHub Pages

1. Envie o conteúdo do diretório para a branch `main`.
2. Abra **Settings → Pages**.
3. Selecione **Deploy from a branch**.
4. Escolha `main` e `/ (root)`.
5. Salve.

## Estrutura

```text
ImpervaDataSecurityAcademy/
├── index.html
├── README.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
├── favicon.svg
├── site.webmanifest
├── robots.txt
├── sitemap.xml
└── assets/
    ├── css/style.css
    ├── js/app.js
    └── images/social-preview.svg
```

## Recursos oficiais

O portal reúne links para documentação, DAM, Data Security Fabric, suporte, Coverage Tool, treinamento e catálogo oficial. Alguns recursos aparecem com identidade Thales porque a Imperva integra o portfólio da Thales.

## Privacidade

O progresso e as preferências são armazenados somente no navegador usando `localStorage`. Não existe backend nem envio de dados pessoais.

## Autoria

**Desenvolvido por Renato Barros**  
**Barros & Barros Consultoria e Suporte**

Oracle Database • SQL Server • Cyber Security • Data Security • Cloud Technologies

© 2026 Barros & Barros Consultoria e Suporte. Todos os direitos reservados.


## Novidades v2.1.2
- Simulação de novo incidente com criação, abertura automática, atualização de KPIs e destaque visual.
- Teste global de políticas com progresso, resultados por política e resumo de severidades.
- Terminal com 10 novos comandos administrativos e explicação operacional após cada execução.
- Oracle Lab com 10 novos cenários.
- SQL Server Lab com 10 novos cenários.


## Investigation v2.1.2

O botão **Simular 6 incidentes** executa uma sequência visual completa com seis casos diferentes. Cada etapa atualiza a fila, abre o workbench, recalcula os KPIs e mostra o progresso de 1/6 a 6/6.


## v2.1.2 — Incident Detail & Routing Center

O botão **Abrir incidente atual** agora abre uma ficha executiva completa contendo classificação, impacto, SLA, fila responsável, departamento, owner, evidências, fluxo de escalonamento, recomendação inicial e ações de encaminhamento para fila, criação de ticket ITSM e abertura do workbench técnico.


## v3.0.2 Final Release

### Connections Center

- Assistente de conexão Oracle e SQL Server.
- Test Connection, validação de privilégios e Enable Monitoring.
- Checklist de readiness, logs, health, latência, cobertura e fluxo de onboarding.
- Todos os dados e resultados são simulações educacionais locais.

### About Platform

- Objetivo do projeto, tecnologias, recursos, créditos, aviso legal e roadmap.
- Referências de conteúdo: Imperva DAM/DSF 15.4, Oracle Database 19c/23ai e SQL Server 2019/2022.
- As versões são referências educacionais e não representam uma certificação de compatibilidade.
