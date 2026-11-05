Oracle Data Guard Command Center

Laboratório Interativo desenvolvido para profissionais Oracle Database, DBAs, Database Engineers, Cloud Engineers e equipes de alta disponibilidade que desejam aprender, praticar e validar conceitos de Oracle Data Guard através de um ambiente visual, guiado e interativo.

⸻

Visão Geral

O Oracle Data Guard Command Center foi criado para servir como um centro de treinamento operacional focado em Alta Disponibilidade (HA) e Disaster Recovery (DR) utilizando Oracle Data Guard.

O projeto simula um ambiente Oracle Database 19c contendo:

* Primary Database
* Physical Standby Database
* Redo Transport Services
* Managed Recovery Process (MRP)
* Data Guard Broker
* Switchover
* Failover
* Fast-Start Failover (FSFO)
* Oracle RAC
* Monitoramento Operacional
* Troubleshooting
* Certificação Final

⸻

Objetivo do Projeto

O objetivo deste laboratório é permitir que DBAs e equipes de infraestrutura compreendam todo o ciclo operacional de uma solução Oracle Data Guard.

O treinamento aborda desde a preparação inicial do ambiente até cenários avançados de recuperação de desastre.

Incluindo:

* Configuração do Primary Database
* Criação do Standby Database
* Aplicação de Redo
* Monitoramento
* Operações de Switchover
* Operações de Failover
* Broker Management
* RAC Data Guard
* FSFO
* Troubleshooting

⸻

Principais Recursos

Dashboard Operacional

O projeto apresenta um dashboard visual contendo:

* Status do Primary
* Status do Standby
* Health Check
* Redo Apply
* Transporte de Archive Logs
* MRP Status
* Progressão das atividades

⸻

Simulador Interativo

O laboratório possui um simulador integrado que permite executar comandos Data Guard para fins educacionais.

Exemplos:

archive log list
select database_role from v$database;
select open_mode from v$database;
select process,status from v$managed_standby;
dgmgrl
show configuration
show database verbose
switchover to standby
failover to standby

O simulador retorna resultados inspirados em ambientes Oracle Database reais.

⸻

Conteúdo Técnico

Fundamentos

* Introdução ao Oracle Data Guard
* Conceitos de Alta Disponibilidade
* Disaster Recovery
* RTO
* RPO
* Protection Modes

⸻

Administração

* Primary Database
* Physical Standby
* Redo Transport
* Managed Recovery Process
* Archive Logs
* Standby Redo Logs
* Password File
* Listener
* TNS Configuration

⸻

Data Guard Broker

* DGMGRL
* Show Configuration
* Show Database
* Enable Configuration
* Disable Configuration
* Observer
* FSFO

⸻

Operações

Switchover

* Planejamento
* Validação
* Execução
* Pós-Validação

Failover

* Cenários de Desastre
* Failover Manual
* Failover Automático
* Reinstate Database

⸻

Oracle RAC

* Data Guard com RAC
* Thread Management
* Standby Redo Logs
* Broker em RAC
* Validações Operacionais

⸻

Monitoramento

* V$DATABASE
* V$MANAGED_STANDBY
* V$ARCHIVE_DEST_STATUS
* V$DATAGUARD_STATS
* Alert Log
* Broker Monitoring

⸻

Troubleshooting

O projeto apresenta diversos cenários simulados para treinamento:

* Gap de Archive Logs
* MRP Stopped
* Redo Transport Error
* Broker Configuration Error
* Listener Issues
* Standby Sync Delay
* FSFO Problems

⸻

Trilha Operacional

O laboratório conduz o aluno através de todas as etapas necessárias para implementação e administração do Data Guard.

Módulo 1

Preparação do Primary Database

Módulo 2

Criação do Physical Standby

Módulo 3

Configuração dos Parâmetros Data Guard

Módulo 4

Validação da Sincronização

Módulo 5

Monitoramento Operacional

Módulo 6

Data Guard Broker

Módulo 7

Switchover

Módulo 8

Failover

Módulo 9

FSFO

Módulo 10

Troubleshooting

⸻

Certificação

Ao concluir todas as missões obrigatórias:

* O progresso é validado automaticamente
* O certificado é liberado
* O nome do participante é incorporado ao certificado
* O certificado pode ser exportado

⸻

Público-Alvo

Este projeto foi desenvolvido para:

* Oracle DBAs
* Database Engineers
* Cloud Engineers
* Infrastructure Engineers
* Site Reliability Engineers (SRE)
* Arquitetos de Soluções
* Consultores Oracle

⸻

Tecnologias Utilizadas

* HTML5
* CSS3
* JavaScript
* Design Responsivo
* Simulador Interativo
* Dashboard Dinâmico
* Certificação Automática

⸻

Como Utilizar

Clone o repositório:

git clone https://github.com/SEU-USUARIO/oracle-dataguard-command-center.git

Entre na pasta:

cd oracle-dataguard-command-center

Abra o arquivo:

index.html

Ou publique diretamente utilizando GitHub Pages.

⸻

GitHub Pages

O projeto pode ser disponibilizado através do GitHub Pages:

https://SEU-USUARIO.github.io/oracle-dataguard-command-center/

⸻

Autor

Renato Barros

Database Engineer Specialist

Oracle Database | RAC | Data Guard | GoldenGate | Exadata | OCI | AWS | Azure | Multicloud

⸻

Aviso Importante

Este laboratório possui finalidade exclusivamente educacional.

Antes de aplicar qualquer configuração em ambientes produtivos, valide cuidadosamente:

* Oracle Home
* Oracle Base
* Paths de Archive Logs
* FRA
* Password Files
* Listener
* TNS
* Service Names
* DB_UNIQUE_NAME
* Standby Redo Logs
* Broker Configuration
* Requisitos de RTO e RPO

Cada ambiente possui características específicas que devem ser analisadas individualmente.

⸻

Licença

Projeto disponibilizado para fins educacionais, treinamento técnico e compartilhamento de conhecimento com a comunidade Oracle.
# Oracle_Dataguard_Command
