# Oracle Data Guard Enterprise Academy

> Plataforma interativa de treinamento para Oracle AI Database 26ai
> (23.26) com Oracle Data Guard, RMAN, ASM e Data Guard Broker.

## Visão Geral

O **Oracle Data Guard Enterprise Academy** transforma um laboratório
técnico em uma experiência de treinamento interativa executada
diretamente no navegador.

Entre os principais recursos:

-   Dashboard Enterprise
-   Terminal Oracle realista (Shell, SQL\*Plus, RMAN e DGMGRL)
-   Simulações operacionais
-   Arquitetura animada do Data Guard
-   Switchover com animação
-   Exercícios guiados
-   Barra de progresso
-   Certificado de conclusão
-   Exportação para PDF e PNG
-   Funciona 100% em HTML/CSS/JavaScript (GitHub Pages)

------------------------------------------------------------------------

# Funcionalidades

-   Simulação completa de Oracle Data Guard
-   Oracle AI Database 26ai (23.26)
-   Oracle ASM
-   Oracle RMAN
-   Oracle Data Guard Broker
-   Active Data Guard
-   Snapshot Standby
-   FSFO
-   Timeline do laboratório
-   Dashboard de monitoramento
-   LEDs de status
-   Terminal interativo
-   Certificado automático

------------------------------------------------------------------------

# Conteúdo do treinamento

1.  Planejamento do ambiente
2.  CDB x Non-CDB
3.  Preparação do Primary
4.  Configuração de rede
5.  Standby NOMOUNT
6.  RMAN DUPLICATE
7.  Data Guard Broker
8.  Validação da replicação
9.  Switchover
10. Failover
11. Fast-Start Failover
12. Snapshot Standby
13. Active Data Guard
14. Troubleshooting
15. Encerramento do laboratório

------------------------------------------------------------------------

# Como executar localmente

``` bash
git clone https://github.com/SEU-USUARIO/OracleDataGuardEnterpriseAcademy.git

cd OracleDataGuardEnterpriseAcademy

python3 -m http.server 8080
```

Abra:

    http://localhost:8080

Também é possível abrir o `index.html` diretamente no navegador.

------------------------------------------------------------------------

# Publicando no GitHub Pages

1.  Faça o push para o GitHub.
2.  Abra **Settings → Pages**.
3.  Em **Source**, selecione:
    -   Deploy from Branch
    -   Branch: `main`
    -   Folder: `/ (root)`
4.  Salve.
5.  Aguarde alguns minutos.

O site ficará disponível em:

    https://SEU-USUARIO.github.io/OracleDataGuardEnterpriseAcademy/

## Domínio personalizado

Caso utilize um domínio próprio:

1.  Adicione um arquivo `CNAME` na raiz do projeto.
2.  Informe o domínio (ex.: `academy.barros.inf.br`).
3.  Configure os registros DNS no provedor.

------------------------------------------------------------------------

# Estrutura do projeto

``` text
OracleDataGuardEnterpriseAcademy/
├── index.html
├── README.md
├── LICENSE
└── assets/
```

------------------------------------------------------------------------

# Certificado

Após concluir 100% do treinamento:

-   Visualizar certificado
-   Imprimir
-   Salvar em PDF
-   Baixar em PNG

------------------------------------------------------------------------

# Tecnologias

-   HTML5
-   CSS3
-   JavaScript
-   SVG
-   LocalStorage

------------------------------------------------------------------------

# Créditos

**Desenvolvimento da plataforma**

Renato Barros

Barros & Barros Consultoria e Suporte

O conteúdo técnico do laboratório foi utilizado como inspiração mediante
autorização do autor para criação desta plataforma educacional. Toda a
interface, experiência do usuário, terminal, dashboards, animações,
certificado e recursos interativos foram desenvolvidos especificamente
para este projeto.

------------------------------------------------------------------------

# Licença

Projeto desenvolvido para fins educacionais e demonstração técnica.
