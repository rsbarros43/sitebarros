# Oracle Database 19c Installation on Oracle Linux 8 (OL8)  
## Oracle 19c OL8 Command Center

![Oracle](https://img.shields.io/badge/Oracle-Database%2019c-red)
![Oracle Linux](https://img.shields.io/badge/Oracle%20Linux-8-blue)
![Status](https://img.shields.io/badge/Status-Training%20Lab-success)
![Language](https://img.shields.io/badge/Language-Portugu%C3%AAs-green)

---

## Visão Geral

O **Oracle 19c OL8 Command Center** é um laboratório interativo em português criado para demonstrar, passo a passo, o processo de instalação do **Oracle Database 19c** em **Oracle Linux 8**.

O projeto foi desenvolvido com foco em DBAs Oracle, estudantes, analistas de infraestrutura e profissionais que desejam entender o fluxo completo de instalação, configuração, validação e certificação de um ambiente Oracle Database 19c.

A proposta não é ser apenas uma página estática com comandos, mas sim um **Training Center interativo**, onde o usuário informa seu nome, libera o laboratório, executa comandos simulados, acompanha o progresso, consulta um terminal sticky, realiza validações e conclui o treinamento com quiz e certificado.

---

## Objetivo do Projeto

O objetivo principal deste projeto é transformar um procedimento técnico de instalação Oracle em uma experiência guiada e prática.

O laboratório cobre:

- Preparação do Oracle Linux 8.
- Configuração de hostname e hosts file.
- Instalação de pré-requisitos automáticos.
- Configuração manual de kernel parameters.
- Configuração de limits.
- Criação de usuário e grupos Oracle.
- Preparação de diretórios Oracle.
- Configuração de variáveis de ambiente.
- Instalação do Oracle Database 19c.
- Uso do Oracle Universal Installer.
- Instalação silent com response file.
- Execução de root scripts.
- Aplicação opcional de patches.
- Criação do banco via DBCA.
- Criação de CDB/PDB.
- Configuração de listener.
- Validação com SQL*Plus.
- Health Check pós-instalação.
- Troubleshooting inteligente.
- Modo entrevista Oracle DBA.
- Quiz final com certificado.

---

## Estrutura do Projeto

A estrutura principal do projeto é composta por três páginas HTML:

```text
oracle19c-ol8-command-center/
│
├── index.html
├── index2.html
├── index3.html
├── README.md
└── assets/
```

### `index.html`

Página principal do laboratório.

Contém o fluxo principal da instalação do Oracle Database 19c em Oracle Linux 8.

Inclui:

- Tela de identificação do aluno.
- Bloqueio do conteúdo até informar o nome.
- Dashboard de progresso.
- Terminal Live sticky.
- Comandos executáveis.
- Módulos de instalação.
- Health Check.
- Troubleshooting.
- Modo Entrevista.
- Quiz.
- Certificado.

---

### `index2.html`

Página complementar sobre:

```text
Oracle Universal Installer (OUI) Silent Installations
```

Essa página explica o uso do **Oracle Universal Installer em modo silent**, incluindo:

- Response files.
- Uso básico de response file.
- Command line overrides.
- Instalação silent.
- Uso de `runInstaller`.
- Uso de `-silent`.
- Uso de `-responseFile`.
- Uso de `-ignorePrereq`.
- Uso de `-waitforcompletion`.
- Uso de `-applyRU`.
- Uso de `-applyOneOffs`.

Também possui:

- Terminal sticky.
- Dashboard de progresso.
- Botões Copiar e Executar.
- Link de retorno para o Command Center.

---

### `index3.html`

Página complementar sobre:

```text
Database Configuration Assistant (DBCA): Creating Databases in Silent Mode
```

Essa página explica o uso do **DBCA em modo silent**, incluindo:

- Criação de banco com response file.
- Criação de banco via linha de comando.
- Criação de CDB/PDB.
- Exclusão de banco via DBCA.
- Uso de Oracle Managed Files.
- Validação pós-criação.
- Link para documentação oficial Oracle DBCA Command Reference.

Também possui:

- Terminal sticky.
- Dashboard de progresso.
- Botões Copiar e Executar.
- Link de retorno para o Command Center.

---

## Principais Funcionalidades

### 1. Bloqueio por Nome do Aluno

O laboratório inicia bloqueado.

Para liberar o conteúdo, o usuário precisa informar o nome e clicar em:

```text
INICIAR LAB COMPLETO
```

Após isso:

- Os módulos são liberados.
- O terminal é ativado.
- O nome aparece no dashboard.
- O quiz fica disponível.
- O certificado poderá ser emitido no final.

---

### 2. Terminal Live Sticky

O terminal fica fixo na lateral da tela, permitindo acompanhar a saída dos comandos sem precisar rolar até o final da página.

Esse comportamento simula a experiência de um DBA executando comandos em um terminal SSH.

O terminal mostra:

- Comando executado.
- Resultado simulado.
- Status de sucesso.
- Mensagens de validação.
- Sugestões de troubleshooting.
- Saídas de SQL*Plus.
- Saídas de DBCA.
- Saídas de listener.
- Saídas de OPatch.

---

### 3. Botões Copiar e Executar

Cada comando possui dois botões:

```text
Copiar
Executar
```

O botão **Copiar** permite copiar o comando para uso em ambiente real ou laboratório.

O botão **Executar** envia o comando para o terminal simulado e marca o passo como executado.

---

### 4. Dashboard de Progresso

O dashboard acompanha a evolução do treinamento.

Ele mostra:

- Percentual concluído.
- Nome do aluno.
- Módulos concluídos.
- Quantidade de comandos executados.
- Status visual com check verde.

Exemplo:

```text
SETUP                 ✓
MANUAL                ○
INSTALL               ○
DBCA                  ○
HEALTH                ○
TROUBLESHOOTING       ○
INTERVIEW             ○
```

---

### 5. Módulos do Laboratório Principal

O `index.html` organiza o conteúdo em módulos.

## Módulo 1 — Fundamentos

Explica o objetivo do laboratório e o que será construído:

- Oracle Database 19c.
- Oracle Linux 8.
- Single Instance.
- Oracle Home.
- Oracle Base.
- CDB.
- PDB.
- Listener.
- DBCA.
- SQL*Plus.

---

## Módulo 2 — OL8 Setup

Configuração inicial do sistema operacional.

Inclui:

```bash
/etc/hosts
hostnamectl
oracle-database-preinstall-19c
dnf update
```

Essa etapa prepara o host Oracle Linux para receber a instalação do Oracle Database.

---

## Módulo 3 — Manual Setup

Etapa alternativa ao pacote `oracle-database-preinstall-19c`.

Inclui configuração manual de:

- Kernel parameters.
- Limits.
- Pacotes.
- Grupos.
- Usuário oracle.
- SELinux.
- Firewall.
- Diretórios.
- Variáveis de ambiente.
- Scripts de startup e shutdown.

---

## Módulo 4 — Installation / Patch

Etapa de instalação do software Oracle.

Inclui:

- Definição de `DISPLAY`.
- Extração do ZIP do Oracle Home.
- Execução do `runInstaller`.
- Instalação silent.
- Execução de root scripts.
- Patch opcional com OPatch.

---

## Módulo 5 — DBCA

Etapa de criação do banco.

Inclui:

- Start do listener.
- DBCA interativo.
- DBCA silent.
- Criação de CDB.
- Criação de PDB.
- Configuração de `/etc/oratab`.
- OMF.
- PDB save state.
- Validação com SQL*Plus.
- Validação com listener.
- Scripts `start_all.sh` e `stop_all.sh`.

---

## Módulo 6 — Health Check Pós-instalação

Executa validações finais como:

```sql
select banner from v$version;
select instance_name,status from v$instance;
select name,open_mode,cdb from v$database;
show pdbs
archive log list
```

Também valida:

```bash
lsnrctl status
opatch lspatches
```

---

## Módulo 7 — Troubleshooting Inteligente

O terminal reconhece alguns comandos digitados incorretamente e sugere a correção.

Exemplos:

```bash
lsnrctl stat
```

Sugestão:

```bash
lsnrctl status
```

Outro exemplo:

```bash
sqlplus /as sysdba
```

Sugestão:

```bash
sqlplus / as sysdba
```

Esse recurso ajuda o aluno a entender erros comuns de digitação e operação.

---

## Módulo 8 — Modo Entrevista Oracle DBA

Modo voltado para preparação técnica.

Apresenta perguntas e respostas sobre:

- `/etc/hosts`.
- Pré-requisitos.
- Oracle Home.
- Oracle Base.
- DBCA.
- Listener.
- CDB/PDB.
- Validação final.

Esse módulo ajuda o aluno a explicar tecnicamente o processo em entrevistas, reuniões ou apresentações.

---

## Módulo 9 — Quiz e Certificado

O quiz valida o conhecimento do aluno.

Regras:

- O aluno precisa informar o nome antes.
- O quiz possui perguntas técnicas.
- Nota mínima: 85%.
- Ao atingir a nota, o certificado é liberado.

O certificado contém:

- Nome do aluno.
- Nome do laboratório.
- Data.
- Confirmação de conclusão.

---

## Como Usar o Projeto

### Passo 1 — Baixar o Projeto

Baixe ou clone o repositório:

```bash
git clone https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
```

Entre na pasta:

```bash
cd SEU-REPOSITORIO
```

---

### Passo 2 — Abrir Localmente

Abra o arquivo:

```text
index.html
```

Você pode abrir diretamente no navegador.

Exemplo:

```bash
open index.html
```

No Linux:

```bash
xdg-open index.html
```

No Windows, basta dar duplo clique no arquivo.

---

### Passo 3 — Iniciar o Laboratório

Na tela inicial:

1. Digite o nome do aluno.
2. Clique em **INICIAR LAB COMPLETO**.
3. Aguarde a liberação da trilha.
4. Execute os comandos.
5. Acompanhe o terminal e o dashboard.

---

### Passo 4 — Executar os Módulos

Siga a ordem recomendada:

```text
Fundamentos
OL8 Setup
Manual Setup
Installation
DBCA
Health Check
Troubleshooting
Interview
Quiz
Certificado
```

---

### Passo 5 — Navegar para Materiais Complementares

A página principal possui links para:

```text
Oracle Universal Installer Silent Installations
DBCA Silent Mode
```

Esses materiais abrem:

```text
index2.html
index3.html
```

Para retornar à página principal, clique em:

```text
← Voltar ao Command Center
```

---

## Publicação no GitHub Pages

### Passo 1 — Criar Repositório

Crie um repositório no GitHub.

Exemplo:

```text
oracle19c-ol8-command-center
```

---

### Passo 2 — Enviar Arquivos

Dentro da pasta do projeto:

```bash
git init
git add .
git commit -m "Publicando Oracle 19c OL8 Command Center"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/oracle19c-ol8-command-center.git
git push -u origin main
```

---

### Passo 3 — Ativar GitHub Pages

No GitHub:

1. Acesse o repositório.
2. Clique em **Settings**.
3. Vá até **Pages**.
4. Em **Source**, selecione:
   ```text
   Deploy from a branch
   ```
5. Em **Branch**, selecione:
   ```text
   main
   ```
6. Pasta:
   ```text
   /root
   ```
7. Clique em **Save**.

Após alguns minutos, o GitHub irá gerar um link como:

```text
https://SEU-USUARIO.github.io/oracle19c-ol8-command-center/
```

---

## Requisitos

Este projeto não exige backend, banco de dados ou servidor de aplicação.

Requisitos:

- Navegador moderno.
- HTML5.
- CSS3.
- JavaScript.
- GitHub Pages, se quiser publicar online.

Não é necessário instalar:

- Node.js.
- Python.
- Apache.
- Nginx.
- Banco de dados real.

---

## Observação Importante

Este projeto é um laboratório educacional.

Os comandos simulam a execução de um ambiente Oracle Linux com Oracle Database 19c.

Antes de usar comandos em produção, revise:

- Documentação oficial Oracle.
- README dos patches.
- Requisitos de licenciamento.
- Requisitos de suporte.
- Política de segurança da empresa.
- Padrões internos de infraestrutura.
- Parâmetros de sizing.
- Backup e plano de rollback.

---

## Conteúdo Técnico Abordado

Este laboratório aborda conceitos importantes para DBAs Oracle:

- Oracle Database 19c.
- Oracle Linux 8.
- UEK.
- Oracle Universal Installer.
- Silent Installation.
- Response File.
- Oracle Inventory.
- Oracle Base.
- Oracle Home.
- OPatch.
- DBCA.
- CDB.
- PDB.
- Listener.
- SQL*Plus.
- OMF.
- `/etc/oratab`.
- Startup e shutdown scripts.
- Health Check.
- Troubleshooting.
- Validação pós-instalação.

---

## Sugestões de Uso

Este projeto pode ser usado para:

- Portfólio profissional.
- Treinamento interno.
- Demonstração técnica.
- Aula Oracle DBA.
- Preparação para entrevista.
- Laboratório de instalação.
- Material de estudo.
- Publicação em GitHub Pages.
- Apresentação para clientes.
- Capacitação de DBAs iniciantes.

---

## Diferenciais do Projeto

O diferencial deste projeto é unir documentação, simulação e experiência visual.

Em vez de apenas listar comandos, ele apresenta:

- Explicação antes de cada comando.
- Terminal simulando execução real.
- Dashboard de progresso.
- Validação pós-instalação.
- Troubleshooting inteligente.
- Modo entrevista.
- Certificado.
- Navegação complementar para OUI e DBCA silent.
- Interface visual no padrão Command Center.

---

## Fluxo Visual do Laboratório

```text
Aluno informa nome
        ↓
Laboratório é liberado
        ↓
Executa comandos do OL8
        ↓
Configura pré-requisitos
        ↓
Instala Oracle Database 19c
        ↓
Cria banco via DBCA
        ↓
Valida banco, listener e PDB
        ↓
Executa Health Check
        ↓
Faz Quiz
        ↓
Gera Certificado
```

---

## Roadmap Futuro

Possíveis melhorias futuras:

- Exportar certificado em PDF.
- Salvar progresso em arquivo.
- Criar modo administrador.
- Criar trilha Oracle RAC.
- Criar trilha Data Guard.
- Criar trilha GoldenGate.
- Criar trilha Exadata.
- Criar integração com GitHub Actions.
- Criar versão multi-page modular.
- Criar dashboards adicionais de pós-instalação.

---

## Autor

Projeto desenvolvido para fins educacionais e de portfólio técnico.

**Oracle DBA Academy**  
Laboratório interativo para DBAs Oracle.

---

## Licença

Este projeto pode ser utilizado para estudo, demonstração e treinamento.

Recomenda-se manter os créditos e revisar comandos antes de uso em ambientes reais.

---

## Conclusão

O **Oracle 19c OL8 Command Center** entrega uma experiência completa para estudar o processo de instalação do Oracle Database 19c em Oracle Linux 8.

Ele combina:

- Conteúdo técnico.
- Experiência visual.
- Simulação de terminal.
- Progresso interativo.
- Validação prática.
- Quiz.
- Certificado.

É um projeto pronto para publicação no GitHub Pages e para uso como material de portfólio profissional.
