const modules=[
["Fundamentos","Introdução ao Imperva","Visão geral de segurança de dados e proposta da plataforma.","◈"],
["Fundamentos","Database Activity Monitoring","Conceitos de captura, auditoria e análise de atividades.","⌁"],
["Arquitetura","Data Security Fabric","Componentes e fluxo centralizado de proteção de dados.","⬡"],
["Arquitetura","Management Server","Administração, políticas, usuários e relatórios.","◆"],
["Arquitetura","Gateway e Agentes","Coleta, normalização e encaminhamento de eventos.","⇄"],
["Planejamento","Métodos de monitoramento","Agente, rede, auditoria nativa e cenários híbridos.","◎"],
["Onboarding","Cadastro de ativos","Inclusão e organização das fontes de dados.","＋"],
["Oracle","Oracle Database Monitoring","Sessões, DDL, DML, DCL e usuários privilegiados.","◉"],
["Oracle","Políticas para Oracle","GRANT DBA, SYS, SYSTEM e objetos sensíveis.","▣"],
["SQL Server","SQL Server Monitoring","Logins, T-SQL, roles e atividades administrativas.","▤"],
["SQL Server","Políticas para SQL Server","SYSADMIN, sa, objetos críticos e autenticação.","▥"],
["Data Security","Discovery e classificação","Identificação de CPF, cartões, e-mails e outros dados.","⌕"],
["Data Security","Usuários privilegiados","Monitoramento e separação de funções administrativas.","♟"],
["Proteção","Políticas de segurança","Regras, critérios, severidade e ações de resposta.","◆"],
["Proteção","Alertas e violações","Priorização e tratamento de eventos suspeitos.","⚡"],
["Operação","Investigation Center","Correlação de evidências e análise de comportamento.","⌕"],
["Compliance","Auditoria e relatórios","Trilhas de auditoria e relatórios de conformidade.","▦"],
["Integração","SIEM e resposta","Encaminhamento de eventos e integração operacional.","↗"],
["Operação","Troubleshooting","Saúde de agentes, comunicação e qualidade da coleta.","⚙"],
["Conclusão","Projeto final","Investigação completa de um incidente simulado.","★"]
];
const policies=[
["Acesso privilegiado fora do horário","Detecta atividades de contas administrativas fora da janela autorizada.","HIGH","Oracle + SQL Server","◷"],
["Grant de DBA no Oracle","Alerta quando privilégios DBA são concedidos a um usuário.","CRITICAL","Oracle","◉"],
["Concessão de SYSADMIN","Detecta inclusão de logins na server role sysadmin.","CRITICAL","SQL Server","▤"],
["Consulta a dados sensíveis","Monitora acesso a colunas classificadas como CPF, cartão ou e-mail.","HIGH","Oracle + SQL Server","⌕"],
["Extração massiva de registros","Compara volume acessado com limites e baseline comportamental.","CRITICAL","Oracle + SQL Server","⇩"],
["Exclusão de objeto crítico","Detecta DROP ou TRUNCATE em objetos protegidos.","CRITICAL","Oracle + SQL Server","✕"],
["Falhas repetidas de login","Identifica sequência de autenticações inválidas por origem.","MEDIUM","SQL Server","⚠"],
["Usuário compartilhado","Sinaliza contas utilizadas simultaneamente por origens distintas.","HIGH","Oracle + SQL Server","♟"],
["Mudança sem ticket","Correlaciona DDL administrativo sem referência de mudança aprovada.","MEDIUM","Oracle + SQL Server","◇"],
["Acesso por IP não autorizado","Compara a origem da conexão com redes permitidas.","HIGH","Oracle + SQL Server","◎"]
];
const policyDetails=[
{cat:"Privileged Access",users:"SYS, SYSTEM, sa",objects:"FINANCEIRO.*",ops:"SELECT, DDL",win:"22:00 - 06:00",cmd:"CONNECT SYSTEM@ORCLPRD\nSELECT * FROM FINANCEIRO.CLIENTES;",db:"Oracle + SQL Server",user:"SYSTEM",target:"FINANCEIRO.CLIENTES",origin:"192.168.10.22",risk:88,inc:"INC-481",why:"Uma conta privilegiada acessou dados financeiros fora da janela autorizada.",impact:"Pode indicar abuso de privilégio ou manutenção não aprovada.",facts:[["Horário","02:18"],["Usuário","SYSTEM"],["Origem","192.168.10.22"],["Objeto","CLIENTES"]]},
{cat:"Privilege Escalation",users:"SYS, SYSTEM",objects:"DBA_ROLE_PRIVS",ops:"GRANT DBA",win:"24x7",cmd:"GRANT DBA TO APP_FINANCEIRO;",db:"Oracle",user:"SYSTEM",target:"APP_FINANCEIRO",origin:"192.168.10.22",risk:96,inc:"INC-482",why:"A operação GRANT DBA corresponde ao critério crítico configurado.",impact:"O usuário passa a ter privilégios administrativos amplos.",facts:[["Operação","GRANT DBA"],["Executor","SYSTEM"],["Destino","APP_FINANCEIRO"],["Banco","ORCLPRD"]]},
{cat:"Privilege Escalation",users:"sa, securityadmin",objects:"SERVER ROLE sysadmin",ops:"ALTER SERVER ROLE",win:"24x7",cmd:"ALTER SERVER ROLE sysadmin\nADD MEMBER app_financeiro;",db:"SQL Server",user:"sa",target:"app_financeiro",origin:"192.168.10.70",risk:95,inc:"INC-483",why:"Um login foi incluído na server role sysadmin.",impact:"O login ganha controle administrativo total da instância.",facts:[["Operação","ADD MEMBER"],["Executor","sa"],["Role","sysadmin"],["Login","app_financeiro"]]},
{cat:"Sensitive Data",users:"APP_%, REPORT_%",objects:"CPF, CARD_NUMBER, EMAIL",ops:"SELECT",win:"24x7",cmd:"SELECT CPF, NOME, CARTAO\nFROM FINANCEIRO.CLIENTES;",db:"Oracle + SQL Server",user:"APP_REPORT",target:"FINANCEIRO.CLIENTES",origin:"192.168.10.55",risk:82,inc:"INC-484",why:"A consulta acessou colunas classificadas como sensíveis.",impact:"Pode causar exposição de dados pessoais e risco de conformidade.",facts:[["Dados","CPF / Cartão"],["Usuário","APP_REPORT"],["Registros","4.284"],["Objeto","CLIENTES"]]},
{cat:"Data Exfiltration",users:"APP_%, ETL_%",objects:"FINANCEIRO.*",ops:"SELECT",win:"24x7",cmd:"SELECT * FROM FINANCEIRO.CLIENTES;",db:"Oracle + SQL Server",user:"APP_BATCH",target:"FINANCEIRO.CLIENTES",origin:"192.168.20.34",risk:98,inc:"INC-485",why:"O volume consultado excedeu significativamente o baseline.",impact:"Pode representar exfiltração ou processo automatizado fora de controle.",facts:[["Registros","185.430"],["Baseline","10.040"],["Desvio","+1.747%"],["Horário","02:18"]]},
{cat:"Destructive Activity",users:"DBA_%, SYS, sa",objects:"AUDITORIA_*, CLIENTES",ops:"DROP, TRUNCATE",win:"24x7",cmd:"DROP TABLE FINANCEIRO.AUDITORIA_CLIENTES;",db:"Oracle + SQL Server",user:"DBA_SUPORTE",target:"AUDITORIA_CLIENTES",origin:"192.168.10.18",risk:97,inc:"INC-486",why:"Uma operação destrutiva atingiu um objeto crítico.",impact:"Pode causar indisponibilidade, perda de dados e perda de evidências.",facts:[["Operação","DROP TABLE"],["Objeto","AUDITORIA_CLIENTES"],["Executor","DBA_SUPORTE"],["Mudança","Não encontrada"]]},
{cat:"Authentication",users:"Todos",objects:"LOGIN",ops:"LOGIN FAILED",win:"24x7",cmd:"-- 12 tentativas inválidas\nLOGIN unknown@SQLPROD01;",db:"SQL Server",user:"unknown",target:"SQLPROD01",origin:"172.16.5.91",risk:72,inc:"INC-487",why:"A mesma origem realizou várias autenticações inválidas.",impact:"Pode indicar força bruta ou credencial incorreta em aplicação.",facts:[["Tentativas","12"],["Origem","172.16.5.91"],["Destino","SQLPROD01"],["Janela","60 segundos"]]},
{cat:"Shared Account",users:"SYS, SYSTEM, sa",objects:"Todos",ops:"LOGIN, SQL",win:"24x7",cmd:"SYSTEM from 10.0.0.10\nSYSTEM from 192.168.1.90",db:"Oracle + SQL Server",user:"SYSTEM",target:"Multiple Sessions",origin:"2 ORIGINS",risk:78,inc:"INC-488",why:"A mesma conta apareceu simultaneamente em origens distintas.",impact:"Contas compartilhadas reduzem rastreabilidade e responsabilização.",facts:[["Conta","SYSTEM"],["Origens","2"],["Sessões","Simultâneas"],["Owner","Não identificado"]]},
{cat:"Change Governance",users:"DBA_%, SYS, sa",objects:"SCHEMA, TABLE",ops:"DDL",win:"24x7",cmd:"ALTER TABLE FINANCEIRO.CLIENTES\nADD FLAG_RISCO VARCHAR2(1);",db:"Oracle + SQL Server",user:"DBA_APP",target:"FINANCEIRO.CLIENTES",origin:"192.168.10.30",risk:67,inc:"INC-489",why:"A alteração DDL não possui mudança aprovada associada.",impact:"Mudanças não controladas podem gerar indisponibilidade e falhas de auditoria.",facts:[["Operação","ALTER TABLE"],["Ticket","Não encontrado"],["Executor","DBA_APP"],["Objeto","CLIENTES"]]},
{cat:"Network Access",users:"Todos",objects:"DATABASE CONNECTION",ops:"LOGIN",win:"24x7",cmd:"CONNECT APP_WEB@ORCLPRD\nSOURCE_IP=203.0.113.77",db:"Oracle + SQL Server",user:"APP_WEB",target:"ORCLPRD",origin:"203.0.113.77",risk:84,inc:"INC-490",why:"A conexão veio de endereço fora das redes autorizadas.",impact:"Pode indicar acesso externo indevido ou host comprometido.",facts:[["Origem","203.0.113.77"],["Rede permitida","10.0.0.0/8"],["Usuário","APP_WEB"],["Destino","ORCLPRD"]]}
];
const policyPlaybookDefault=[["Verificar usuário","Confirmar identidade e responsabilidade."],["Validar origem","Comparar IP com redes autorizadas."],["Consultar mudança","Procurar ticket ou janela aprovada."],["Confirmar owner","Validar a atividade com o responsável."],["Registrar decisão","Documentar evidências e encerramento."]];
const policyRemediationDefault=["Aplicar privilégio mínimo.","Revisar contas e origens autorizadas.","Exigir mudança aprovada.","Manter integração com SIEM e trilha de auditoria."];
let currentPolicyIndex=null,currentPolicySeverity="HIGH",currentPlaybookDone=new Set();

let events=[
["29/07/2026 22:18:44","Oracle","APP_BATCH","SELECT 185K ROWS","Mass Data Extraction","CRITICAL","OPEN"],
["29/07/2026 21:52:10","SQL Server","sa","ALTER SERVER ROLE","Unauthorized Sysadmin Grant","CRITICAL","OPEN"],
["29/07/2026 20:44:07","Oracle","SYSTEM","GRANT DBA","Privilege Escalation","CRITICAL","INVESTIGATING"],
["29/07/2026 19:33:51","SQL Server","app_api","SELECT Clientes","Sensitive Data Access","HIGH","OPEN"],
["29/07/2026 18:17:29","Oracle","DBA_SUPORTE","DROP TABLE","Critical Object Change","CRITICAL","OPEN"],
["29/07/2026 17:05:13","SQL Server","etl_user","BULK SELECT","Mass Data Extraction","HIGH","CLOSED"],
["29/07/2026 16:42:08","Oracle","APP_WEB","LOGIN","Unauthorized Source IP","MEDIUM","CLOSED"],
["29/07/2026 15:10:47","SQL Server","report_user","SELECT Cartoes","Sensitive Data Access","HIGH","INVESTIGATING"],
["29/07/2026 14:09:32","Oracle","SYS","ALTER USER","Privileged User Activity","MEDIUM","CLOSED"],
["29/07/2026 13:57:01","SQL Server","unknown","LOGIN FAILED × 12","Repeated Login Failure","MEDIUM","OPEN"]
];
const quizzes=[
["Qual é o principal objetivo do Database Activity Monitoring?",["Substituir o banco de dados","Monitorar e analisar atividades executadas nos dados","Criar backups automaticamente","Aumentar a memória do servidor"],1],
["O que representa a separação de funções?",["O DBA apaga a auditoria","A auditoria é controlada independentemente do banco monitorado","Todos usam a conta SYS","O Gateway substitui o banco"],1],
["Qual operação indica possível escalação de privilégio Oracle?",["SELECT SYSDATE","GRANT DBA TO usuario","COMMIT","CREATE INDEX comum"],1],
["No SQL Server, qual concessão merece severidade crítica?",["db_datareader","public","sysadmin","guest"],2],
["O que é classificação de dados?",["Compactação de tabelas","Identificação e categorização de dados sensíveis","Criação de índices","Alteração do charset"],1],
["Qual cenário sugere possível exfiltração?",["Uma consulta pequena habitual","Extração massiva fora do padrão","Um COMMIT normal","Consulta ao catálogo"],1],
["Para que serve o Investigation Center?",["Instalar o Oracle","Correlacionar evidências e investigar incidentes","Compilar T-SQL","Criar máquinas virtuais"],1],
["O que uma política de segurança define?",["Somente a cor do dashboard","Condições, severidade e resposta a atividades","A senha de todos os usuários","O tamanho do datafile"],1],
["Qual integração recebe eventos para correlação corporativa?",["DNS","SIEM","DHCP","NTP"],1],
["Esta academia executa um Imperva real?",["Sim, com agentes reais","Não, é uma simulação educacional no navegador","Sim, via banco embutido","Somente no Oracle"],1]
];
const oracleScenarios={
sensitive:{sql:"SELECT cpf, nome, limite_credito\nFROM financeiro.clientes\nWHERE limite_credito > 25000;",policy:"Sensitive Data Access",severity:"HIGH",user:"APP_FIN",object:"FINANCEIRO.CLIENTES",records:"284",origin:"192.168.10.55",action:"Alert Generated"},
grant:{sql:'GRANT DBA TO app_financeiro;',policy:"Oracle Privilege Escalation",severity:"CRITICAL",user:"SYSTEM",object:"APP_FINANCEIRO",records:"N/A",origin:"192.168.10.22",action:"SOC Notification"},
mass:{sql:"SELECT * FROM financeiro.clientes;",policy:"Mass Data Extraction",severity:"CRITICAL",user:"APP_BATCH",object:"FINANCEIRO.CLIENTES",records:"185.430",origin:"192.168.20.34",action:"Investigation Opened"},
drop:{sql:"DROP TABLE financeiro.auditoria_clientes PURGE;",policy:"Critical Object Change",severity:"CRITICAL",user:"DBA_SUPORTE",object:"FINANCEIRO.AUDITORIA_CLIENTES",records:"N/A",origin:"192.168.10.18",action:"Immediate Alert"},
offhours:{sql:"SELECT * FROM financeiro.cartoes;",policy:"Privileged Off-hours Access",severity:"HIGH",user:"SYSTEM",object:"FINANCEIRO.CARTOES",records:"3.284",origin:"192.168.10.22",action:"Behavior Alert"},
auditoff:{sql:"NOAUDIT ALL BY APP_FINANCEIRO;",policy:"Oracle Audit Disabled",severity:"CRITICAL",user:"SYSTEM",object:"AUDIT CONFIGURATION",records:"N/A",origin:"192.168.10.22",action:"Immediate Alert"},
createuser:{sql:"CREATE USER app_temp IDENTIFIED BY Temp#2026;",policy:"Unauthorized User Creation",severity:"HIGH",user:"SYSTEM",object:"APP_TEMP",records:"N/A",origin:"192.168.10.22",action:"Governance Review"},
alteruser:{sql:"ALTER USER SYSTEM ACCOUNT UNLOCK;",policy:"Privileged Account Change",severity:"CRITICAL",user:"SYS",object:"SYSTEM",records:"N/A",origin:"192.168.10.10",action:"Incident Opened"},
truncate:{sql:"TRUNCATE TABLE financeiro.transacoes;",policy:"Critical Object Truncate",severity:"CRITICAL",user:"DBA_SUPORTE",object:"FINANCEIRO.TRANSACOES",records:"2.480.000",origin:"192.168.10.18",action:"Containment Recommended"},
export:{sql:"BEGIN UTL_FILE.PUT_LINE(v_file, v_customer_data); END;",policy:"Unapproved Data Export",severity:"HIGH",user:"APP_BATCH",object:"UTL_FILE",records:"24.500",origin:"192.168.20.34",action:"Export Review"},
dblink:{sql:"CREATE DATABASE LINK EXT_FIN CONNECT TO ext_user IDENTIFIED BY x USING 'EXTDB';",policy:"Database Link Creation",severity:"HIGH",user:"SYSTEM",object:"EXT_FIN",records:"N/A",origin:"192.168.10.22",action:"Architecture Alert"},
failedlogin:{sql:"-- 15 falhas ORA-01017 para APP_WEB",policy:"Repeated Oracle Login Failure",severity:"MEDIUM",user:"APP_WEB",object:"ORCLPRD",records:"15 tentativas",origin:"172.16.10.44",action:"Source Monitored"},
sysselect:{sql:"SELECT cpf, cartao FROM financeiro.clientes;",policy:"SYS Sensitive Data Access",severity:"CRITICAL",user:"SYS",object:"FINANCEIRO.CLIENTES",records:"8.914",origin:"192.168.10.10",action:"SOC Notification"},
ddlprod:{sql:"ALTER TABLE financeiro.clientes ADD risco NUMBER;",policy:"DDL Without Change Ticket",severity:"HIGH",user:"DBA_APP",object:"FINANCEIRO.CLIENTES",records:"N/A",origin:"192.168.10.30",action:"Change Validation"},
password:{sql:"ALTER USER SYS IDENTIFIED BY NewPassword#2026;",policy:"Critical Password Change",severity:"CRITICAL",user:"SYS",object:"SYS",records:"N/A",origin:"192.168.10.10",action:"Immediate Alert"}
};
const sqlScenarios={
sensitive:{sql:"SELECT cpf, nome, cartao\nFROM Financeiro.dbo.Clientes\nWHERE saldo > 50000;",policy:"Sensitive Data Access",severity:"HIGH",user:"app_api",object:"Financeiro.dbo.Clientes",records:"412",origin:"192.168.10.77",action:"Alert Generated"},
sysadmin:{sql:"ALTER SERVER ROLE sysadmin\nADD MEMBER app_financeiro;",policy:"Unauthorized Sysadmin Grant",severity:"CRITICAL",user:"sa",object:"app_financeiro",records:"N/A",origin:"192.168.10.70",action:"SOC Notification"},
mass:{sql:"SELECT * FROM Financeiro.dbo.Clientes;",policy:"Mass Data Extraction",severity:"CRITICAL",user:"etl_user",object:"Financeiro.dbo.Clientes",records:"98.521",origin:"192.168.20.80",action:"Investigation Opened"},
drop:{sql:"DROP TABLE Financeiro.dbo.AuditoriaClientes;",policy:"Critical Object Change",severity:"CRITICAL",user:"sa",object:"dbo.AuditoriaClientes",records:"N/A",origin:"192.168.10.70",action:"Immediate Alert"},
failed:{sql:"-- Simulação de 12 tentativas de login inválidas",policy:"Repeated Login Failure",severity:"MEDIUM",user:"unknown",object:"SQLPROD01",records:"12 tentativas",origin:"172.16.5.91",action:"Source Monitored"},
disableaudit:{sql:"ALTER SERVER AUDIT Audit_Financeiro WITH (STATE = OFF);",policy:"SQL Server Audit Disabled",severity:"CRITICAL",user:"sa",object:"Audit_Financeiro",records:"N/A",origin:"192.168.10.70",action:"Immediate Alert"},
createlogin:{sql:"CREATE LOGIN app_temp WITH PASSWORD = 'Temp#2026';",policy:"Unauthorized Login Creation",severity:"HIGH",user:"sa",object:"app_temp",records:"N/A",origin:"192.168.10.70",action:"Governance Review"},
alterlogin:{sql:"ALTER LOGIN sa ENABLE;",policy:"Privileged Login Change",severity:"CRITICAL",user:"security_admin",object:"sa",records:"N/A",origin:"192.168.10.71",action:"Incident Opened"},
truncate:{sql:"TRUNCATE TABLE Financeiro.dbo.Transacoes;",policy:"Critical Table Truncate",severity:"CRITICAL",user:"sa",object:"dbo.Transacoes",records:"1.950.000",origin:"192.168.10.70",action:"Containment Recommended"},
backup:{sql:"BACKUP DATABASE Financeiro TO DISK='\\external\share\fin.bak';",policy:"Unapproved Backup Destination",severity:"HIGH",user:"backup_user",object:"Financeiro",records:"480 GB",origin:"192.168.10.85",action:"Backup Review"},
linkedserver:{sql:"EXEC sp_addlinkedserver @server='EXTSQL';",policy:"Linked Server Creation",severity:"HIGH",user:"sa",object:"EXTSQL",records:"N/A",origin:"192.168.10.70",action:"Architecture Alert"},
impersonate:{sql:"GRANT IMPERSONATE ON LOGIN::sa TO app_financeiro;",policy:"Login Impersonation Grant",severity:"CRITICAL",user:"security_admin",object:"sa",records:"N/A",origin:"192.168.10.71",action:"SOC Notification"},
xpcommand:{sql:"EXEC xp_cmdshell 'whoami';",policy:"OS Command Execution",severity:"CRITICAL",user:"sa",object:"xp_cmdshell",records:"1 command",origin:"192.168.10.70",action:"Immediate Containment"},
ddlprod:{sql:"ALTER TABLE Financeiro.dbo.Clientes ADD Risco INT;",policy:"DDL Without Change Ticket",severity:"HIGH",user:"dba_app",object:"dbo.Clientes",records:"N/A",origin:"192.168.10.72",action:"Change Validation"},
password:{sql:"ALTER LOGIN sa WITH PASSWORD='NewPassword#2026';",policy:"Critical Login Password Change",severity:"CRITICAL",user:"security_admin",object:"sa",records:"N/A",origin:"192.168.10.71",action:"Immediate Alert"}
};

const oracleExtendedMeta=[['auditoff','NOAUDIT','Desativação de auditoria'],['createuser','CREATE USER','Criação de conta'],['alteruser','ALTER USER','Mudança privilegiada'],['truncate','TRUNCATE','Operação destrutiva'],['export','UTL_FILE','Exportação de dados'],['dblink','DB LINK','Integração externa'],['failedlogin','ORA-01017','Falhas de login'],['sysselect','SYS SELECT','Acesso sensível'],['ddlprod','ALTER TABLE','Mudança sem ticket'],['password','SYS PASSWORD','Senha crítica']];
const sqlExtendedMeta=[['disableaudit','AUDIT OFF','Desativação de auditoria'],['createlogin','CREATE LOGIN','Criação de login'],['alterlogin','ALTER LOGIN','Mudança privilegiada'],['truncate','TRUNCATE','Operação destrutiva'],['backup','BACKUP','Destino externo'],['linkedserver','LINKED SERVER','Integração externa'],['impersonate','IMPERSONATE','Escalação de acesso'],['xpcommand','XP_CMDSHELL','Comando no sistema'],['ddlprod','ALTER TABLE','Mudança sem ticket'],['password','SA PASSWORD','Senha crítica']];
function renderExtendedScenarios(){if($('#oracleExtendedScenarios'))$('#oracleExtendedScenarios').innerHTML=oracleExtendedMeta.map((x,i)=>`<button data-oracle="${x[0]}"><b>${String(i+5).padStart(2,'0')}</b><span>${x[1]}</span><small>${x[2]}</small></button>`).join('');if($('#sqlExtendedScenarios'))$('#sqlExtendedScenarios').innerHTML=sqlExtendedMeta.map((x,i)=>`<button data-sql="${x[0]}"><b>${String(i+5).padStart(2,'0')}</b><span>${x[1]}</span><small>${x[2]}</small></button>`).join('')}

const state={name:localStorage.getItem("impervaName")||"",completed:JSON.parse(localStorage.getItem("impervaModulesV020")||"[]"),quiz:Number(localStorage.getItem("impervaQuiz")||0)};
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
function toast(msg,type="success"){const t=$("#toast");t.textContent=msg;t.className=`toast ${type} show`;setTimeout(()=>t.className="toast",2600)}
function setView(name){$$(".view").forEach(v=>v.classList.remove("active"));$(`#view-${name}`).classList.add("active");$$(".nav-item").forEach(n=>n.classList.toggle("active",n.dataset.view===name));window.scrollTo({top:0});if(innerWidth<761)$("#sidebar").classList.remove("open");if(name==="certificate")updateCertificate();const labels={dashboard:"Dashboard",modules:"Módulos",architecture:"Architecture Center",connections:"Connections Center",oracle:"Oracle Lab",sqlserver:"SQL Server Lab",events:"Central de eventos",policies:"Policy Management Center",investigation:"SOC Investigation Center",documentation:"Documentation Center",official:"Official Resources",downloads:"Downloads Center",installation:"Installation Center",training:"Training Center",monitoring:"Live Monitoring",reports:"Reports Center",demos:"Demo Scenarios",terminal:"Terminal",quiz:"Quiz",certificate:"Certificado",about:"About Platform"};if(labels[name])addRecentActivity(labels[name],name)}
function updateIdentity(){const logged=!!state.name;$("#identityCard").classList.toggle("hidden",logged);$("#welcomeCard").classList.toggle("hidden",!logged);$("#headerUser").textContent=logged?state.name:"Visitante";$("#avatar").textContent=logged?state.name[0].toUpperCase():"V";$("#welcomeName").textContent=state.name;renderModules();updateProgress();updateCertificate()}
function updateProgress(){const p=Math.round(state.completed.length/modules.length*100);$("#sidePercent").textContent=p+"%";$("#sideProgress").style.width=p+"%";$("#sideProgressText").textContent=`${state.completed.length} de ${modules.length} módulos`;$("#modulePercent").textContent=p+"%"}
function renderModules(){const grid=$("#modulesGrid");grid.innerHTML="";modules.forEach((m,i)=>{const completed=state.completed.includes(i);const locked=!state.name||(i>0&&!state.completed.includes(i-1));const el=document.createElement("article");el.className=`module card ${completed?"completed":""} ${locked?"locked":""}`;el.innerHTML=`<span class="module-number">MÓDULO ${String(i+1).padStart(2,"0")} · ${m[0]}</span><div class="module-icon">${locked?"🔒":m[3]}</div><h3>${m[1]}</h3><p>${m[2]}</p><button>${completed?"Revisar atividade →":locked?"Bloqueado":"Abrir atividade →"}</button>`;el.onclick=()=>{if(locked){toast("Conclua a atividade do módulo anterior para avançar.","danger");return}openModuleActivity(i)};grid.appendChild(el)})}
function eventResult(data,db,sql){return `<div class="event-result"><div class="event-banner"><span><small>SECURITY VIOLATION</small><br><strong>${data.policy}</strong></span><b class="severity ${data.severity}">${data.severity}</b></div><div class="event-fields"><span>Database<b>${db}</b></span><span>User / Login<b>${data.user}</b></span><span>Source IP<b>${data.origin}</b></span><span>Object<b>${data.object}</b></span><span>Records / Attempts<b>${data.records}</b></span><span>Response<b>${data.action}</b></span></div><div class="event-sql">${sql.replace(/</g,"&lt;")}</div></div>`}
function runLab(type,key){const sc=type==="oracle"?oracleScenarios[key]:sqlScenarios[key];const editor=type==="oracle"?$("#oracleEditor"):$("#sqlEditor");const output=type==="oracle"?$("#oracleOutput"):$("#sqlOutput");const status=type==="oracle"?$("#oracleEventStatus"):$("#sqlEventStatus");editor.value=sc.sql;status.textContent="ANALISANDO...";status.style.color="var(--orange)";output.innerHTML=`<div class="event-placeholder"><div class="pulse-icon">⌁</div><h3>Correlacionando atividade...</h3><p>Aplicando políticas e baseline comportamental.</p></div>`;setTimeout(()=>{output.innerHTML=eventResult(sc,type==="oracle"?"ORCLPRD":"SQLPROD01",editor.value);status.textContent="VIOLATION DETECTED";status.style.color="var(--red)";toast(`${sc.severity}: ${sc.policy}`,"danger")},650)}
function renderEvents(){const q=$("#eventSearch")?.value.toLowerCase()||"",sev=$("#severityFilter")?.value||"all",db=$("#dbFilter")?.value||"all";$("#eventsTable").innerHTML=events.filter(e=>(sev==="all"||e[5]===sev)&&(db==="all"||e[1]===db)&&e.join(" ").toLowerCase().includes(q)).map(e=>`<tr><td>${e[0]}</td><td><span class="db-chip ${e[1]==="Oracle"?"oracle":"sqlserver"}">${e[1]}</span></td><td>${e[2]}</td><td>${e[3]}</td><td>${e[4]}</td><td><span class="severity ${e[5]}">${e[5]}</span></td><td>${e[6]}</td></tr>`).join("")}
function runGlobalPolicyTest(){const panel=$('#globalPolicyTestPanel'),results=$('#globalPolicyResults'),bar=$('#globalPolicyProgress'),summary=$('#globalPolicySummary');panel.classList.remove('hidden');summary.classList.add('hidden');results.innerHTML='';bar.style.width='0%';$('#globalPolicyTestMessage').textContent='Inicializando Policy Engine e carregando políticas ativas...';panel.scrollIntoView({behavior:'smooth',block:'center'});const active=policies.map((p,i)=>({p,i})).filter(x=>localStorage.getItem(`policy${x.i}`)!=='off');let idx=0,counts={CRITICAL:0,HIGH:0,MEDIUM:0};const timer=setInterval(()=>{if(idx>=active.length){clearInterval(timer);$('#globalPolicyTestMessage').textContent='Teste concluído. Todas as políticas ativas foram executadas contra cenários controlados.';summary.classList.remove('hidden');$('#globalCriticalCount').textContent=counts.CRITICAL||0;$('#globalHighCount').textContent=counts.HIGH||0;$('#globalMediumCount').textContent=counts.MEDIUM||0;$('#globalPassedCount').textContent=active.length;$('#policyLastTriggerKpi').textContent='agora';toast(`Teste global concluído: ${active.length} políticas validadas.`);return}const {p,i}=active[idx];counts[p[2]]=(counts[p[2]]||0)+1;const row=document.createElement('div');row.className='global-policy-row';row.innerHTML=`<span class="global-test-index">${String(idx+1).padStart(2,'0')}</span><div><b>${p[0]}</b><small>${p[3]} · ${policyDetails[i].operations}</small></div><span class="severity ${p[2]}">${p[2]}</span><strong>POLICY MATCH</strong>`;results.appendChild(row);bar.style.width=`${Math.round((idx+1)/active.length*100)}%`;$('#globalPolicyTestMessage').textContent=`Executando ${p[0]}...`;idx++},280)}
function renderPolicies(){const g=$("#policiesGrid"),q=$("#policySearch")?.value.toLowerCase()||"",s=$("#policySeverityFilter")?.value||"all",d=$("#policyDatabaseFilter")?.value||"all";g.innerHTML="";policies.forEach((p,i)=>{if((s!=="all"&&p[2]!==s)||(d!=="all"&&p[3]!==d)||![...p,...Object.values(policyDetails[i])].join(" ").toLowerCase().includes(q))return;const a=localStorage.getItem(`policy${i}`)!=="off",e=document.createElement("article");e.className="policy card";e.dataset.policyCard=i;e.innerHTML=`<div class="policy-top"><span class="policy-icon">${p[4]}</span><span class="switch ${a?"on":""}" data-policy="${i}"></span></div><h3>${p[0]}</h3><p>${p[1]}</p><div class="policy-meta"><span class="severity ${p[2]}">${p[2]}</span><span>${p[3]}</span></div><div class="policy-open">Abrir Policy Studio →</div>`;g.appendChild(e)});updatePolicyMetric()}
function updatePolicyMetric(){let a=0;policies.forEach((_,i)=>{if(localStorage.getItem(`policy${i}`)!=="off")a++});$("#activePoliciesMetric").textContent=a;if($("#policyEnabledKpi"))$("#policyEnabledKpi").textContent=a;if($("#policyDisabledKpi"))$("#policyDisabledKpi").textContent=policies.length-a}
function renderQuiz(){const box=$("#quizContainer");box.innerHTML=quizzes.map((q,i)=>`<article class="question card"><h3><span>${String(i+1).padStart(2,"0")}</span>${q[0]}</h3><div class="options">${q[1].map((o,j)=>`<label><input type="radio" name="q${i}" value="${j}">${o}</label>`).join("")}</div></article>`).join("");$("#quizScore").textContent=state.quiz?state.quiz+"%":"--"}
function submitQuiz(){if(!state.name){toast("Identifique-se antes de realizar o quiz.","danger");return}let score=0,answered=0;quizzes.forEach((q,i)=>{const a=$(`input[name=q${i}]:checked`);if(a){answered++;if(Number(a.value)===q[2])score++}});if(answered<quizzes.length){toast(`Responda todas as questões (${answered}/${quizzes.length}).`,"danger");return}state.quiz=Math.round(score/quizzes.length*100);localStorage.setItem("impervaQuiz",state.quiz);$("#quizScore").textContent=state.quiz+"%";toast(state.quiz>=70?`Aprovado com ${state.quiz}%!`:`Resultado ${state.quiz}%. Revise e tente novamente.`,state.quiz>=70?"success":"danger");updateCertificate()}
function updateCertificate(){const reqName=!!state.name,reqModules=state.completed.length===modules.length,reqQuiz=state.quiz>=70;[["#reqName",reqName,"Aluno identificado"],["#reqModules",reqModules,"Módulos concluídos"],["#reqQuiz",reqQuiz,"Quiz aprovado"]].forEach(([id,ok,text])=>{$(id).textContent=`${ok?"✓":"○"} ${text}`;$(id).classList.toggle("met",ok)});const unlocked=reqName&&reqModules&&reqQuiz;$("#certificateLock").classList.toggle("hidden",unlocked);$("#certificate").classList.toggle("hidden",!unlocked);if(unlocked){$("#certName").textContent=state.name;$("#certScore").textContent=state.quiz+"%";$("#certDate").textContent=new Date().toLocaleDateString("pt-BR")}}

const moduleActivities = [
{
 objective:"Compreender o papel do Imperva na proteção de dados corporativos.",
 concept:"A plataforma fornece visibilidade, políticas, auditoria e investigação sem depender apenas dos logs administrados pelo próprio banco.",
 expected:"Diferenciar proteção de dados, monitoramento de atividade e resposta a incidentes.",
 procedure:["Identificar os bancos e aplicações que manipulam dados críticos.","Mapear usuários privilegiados, aplicações e origens de conexão.","Definir quais atividades precisam ser monitoradas.","Centralizar eventos para análise e auditoria independente."],
 scenarios:[
  ["success","DESCOBERTA","Ativo reconhecido","A fonte ORCLPRD foi identificada e classificada.","Asset Discovery","ORCLPRD","REGISTERED","A fonte foi adicionada ao inventário de dados com sucesso."],
  ["alert","ALERTA","Conta privilegiada detectada","A conta SYSTEM iniciou atividade administrativa.","Privileged User","SYSTEM","HIGH","A plataforma elevou a prioridade por se tratar de usuário privilegiado."],
  ["error","ERRO","Fonte sem comunicação","O banco SQLPROD01 não enviou heartbeat.","Connectivity","SQLPROD01","ERROR","Verifique comunicação, agente e registro do ativo."],
  ["info","INFORMAÇÃO","Inventário consolidado","Oracle e SQL Server aparecem em uma visão única.","Inventory","2 SOURCES","VISIBLE","O inventário centralizado está disponível para a equipe de segurança."]
 ],
 question:"Qual benefício central o Imperva oferece neste contexto?",
 options:["Substituir os bancos Oracle e SQL Server","Centralizar visibilidade, políticas e auditoria das atividades nos dados","Apenas gerar backups","Criar aplicações web"],answer:1
},
{
 objective:"Entender como o DAM captura e analisa operações realizadas nos bancos.",
 concept:"Database Activity Monitoring observa conexões, usuários, objetos e comandos para identificar riscos e manter uma trilha de auditoria.",
 expected:"Reconhecer um evento normal, uma violação, uma falha de coleta e um evento informativo.",
 procedure:["Receber uma conexão de banco.","Capturar metadados da atividade SQL.","Normalizar usuário, origem, objeto e operação.","Aplicar políticas e atribuir severidade.","Registrar ou encaminhar o evento."],
 scenarios:[
  ["success","SUCESSO","Consulta autorizada","A aplicação consultou um objeto permitido dentro do padrão.","Activity Monitor","APP_WEB","ALLOWED","Evento registrado sem violação."],
  ["alert","ALERTA","Consulta sensível","Uma coluna CPF foi acessada por usuário não habitual.","Sensitive Data","CPF","HIGH","A política de acesso a dados sensíveis foi acionada."],
  ["error","ERRO","Evento incompleto","A origem da conexão não pôde ser resolvida.","Normalization","SOURCE IP","ERROR","O evento foi armazenado para correção de qualidade da coleta."],
  ["info","INFORMAÇÃO","Baseline atualizado","O comportamento normal da aplicação foi recalculado.","Behavior Analytics","APP_WEB","UPDATED","O novo padrão será usado nas próximas análises."]
 ],
 question:"O que o DAM analisa principalmente?",
 options:["Somente espaço em disco","Atividades, usuários, objetos, origens e comandos executados nos dados","Apenas patches do sistema operacional","Somente backups RMAN"],answer:1
},
{
 objective:"Visualizar o fluxo completo da Data Security Fabric.",
 concept:"Fontes de dados, coletores, gateway, gerenciamento, analytics e integrações trabalham como camadas de um processo unificado.",
 expected:"Explicar por onde o evento passa até virar alerta ou evidência.",
 procedure:["O usuário executa uma operação no banco.","O método de monitoramento coleta a atividade.","O Gateway normaliza e encaminha o evento.","A política e o analytics calculam o risco.","Alertas, relatórios ou integrações recebem a decisão."],
 scenarios:[
  ["success","SUCESSO","Fluxo concluído","O evento percorreu todas as camadas da arquitetura.","DSF Pipeline","EVENT-4102","DELIVERED","Evento processado e armazenado para auditoria."],
  ["alert","ALERTA","Risco crítico correlacionado","Quatro políticas foram violadas no mesmo fluxo.","Risk Analytics","EVENT-4103","CRITICAL","Incidente criado automaticamente."],
  ["error","ERRO","Gateway indisponível","O componente central interrompeu o encaminhamento.","Gateway","GW-01","ERROR","Eventos entram em fila até a recuperação."],
  ["info","INFORMAÇÃO","Integração SIEM ativa","O evento foi encaminhado ao SOC.","Integration","SIEM","FORWARDED","Correlação corporativa iniciada."]
 ],
 question:"Qual componente normalmente normaliza e encaminha os eventos coletados?",
 options:["Gateway","Tabela do usuário","Listener Oracle","SQL Server Agent de jobs"],answer:0
},
{
 objective:"Conhecer as funções administrativas e de governança do Management Server.",
 concept:"O gerenciamento centraliza configuração, políticas, usuários, permissões, relatórios e visão operacional.",
 expected:"Distinguir administração da plataforma de coleta de atividade.",
 procedure:["Autenticar com perfil administrativo.","Cadastrar grupos de ativos e responsáveis.","Criar políticas e definir severidades.","Configurar alertas, retenção e relatórios.","Auditar alterações administrativas."],
 scenarios:[
  ["success","SUCESSO","Política publicada","A política foi validada e ativada.","Management","POL-1004","ACTIVE","A nova regra está sendo aplicada aos ativos selecionados."],
  ["alert","ALERTA","Alteração privilegiada","Um administrador mudou uma política crítica.","Admin Audit","SEC_ADMIN","HIGH","A alteração foi registrada na trilha administrativa."],
  ["error","ERRO","Permissão insuficiente","O operador tentou publicar sem privilégio.","RBAC","OPERATOR","DENIED","A ação foi bloqueada pelo controle de acesso."],
  ["info","INFORMAÇÃO","Relatório agendado","O relatório semanal foi configurado.","Reports","WEEKLY","SCHEDULED","A próxima geração ocorrerá na janela definida."]
 ],
 question:"Qual função pertence ao Management Server?",
 options:["Executar SQL da aplicação","Centralizar políticas, usuários e relatórios","Substituir o Oracle Listener","Criar datafiles automaticamente"],answer:1
},
{
 objective:"Entender a relação entre agentes, métodos de coleta e Gateway.",
 concept:"O agente ou outro método observa a atividade próxima à fonte; o Gateway consolida, processa e encaminha.",
 expected:"Identificar estados Healthy, Warning, Error e informação operacional.",
 procedure:["Instalar ou associar o método de monitoramento.","Registrar a fonte e o coletor.","Validar comunicação com o Gateway.","Confirmar recebimento de eventos.","Acompanhar heartbeat e filas."],
 scenarios:[
  ["success","SUCESSO","Agente saudável","Heartbeat e eventos recebidos normalmente.","Agent Health","ora-db01","HEALTHY","Coleta Oracle operacional."],
  ["alert","ALERTA","Fila crescente","O Gateway está processando abaixo do volume recebido.","Queue Monitor","GW-01","WARNING","Capacidade deve ser avaliada."],
  ["error","ERRO","Registro inválido","O agente não reconhece o Gateway configurado.","Registration","sql-db01","ERROR","Refaça o vínculo e valide certificados."],
  ["info","INFORMAÇÃO","Upgrade disponível","Uma versão compatível foi identificada.","Lifecycle","AGENT","NOTICE","Planeje atualização conforme matriz de compatibilidade."]
 ],
 question:"Qual é a responsabilidade principal do agente ou método de monitoramento?",
 options:["Coletar atividades próximas à fonte de dados","Gerar certificados de treinamento","Criar usuários de aplicação","Substituir o Gateway"],answer:0
},
{
 objective:"Comparar métodos de monitoramento e selecionar o mais adequado ao cenário.",
 concept:"A escolha depende de plataforma, visibilidade, impacto, topologia, criptografia e requisitos operacionais.",
 expected:"Avaliar cobertura e limitações antes do onboarding.",
 procedure:["Identificar versão, sistema operacional e topologia do banco.","Verificar tráfego local, remoto e criptografado.","Avaliar privilégios e restrições de instalação.","Selecionar método e documentar limitações.","Executar teste de cobertura."],
 scenarios:[
  ["success","SUCESSO","Método compatível","O agente cobre tráfego local e remoto do Oracle.","Coverage Test","ORCLPRD","PASSED","Cobertura aprovada para produção."],
  ["alert","ALERTA","Cobertura parcial","Conexões locais não aparecem no método de rede.","Coverage Test","SQLPROD01","PARTIAL","Considere método complementar."],
  ["error","ERRO","Versão incompatível","O coletor selecionado não suporta a versão da fonte.","Compatibility","DB VERSION","ERROR","Consulte a matriz e selecione opção suportada."],
  ["info","INFORMAÇÃO","Método híbrido","Duas técnicas serão combinadas para maior cobertura.","Monitoring Plan","HYBRID","PLANNED","O desenho foi registrado."]
 ],
 question:"O que deve orientar a escolha do método de monitoramento?",
 options:["Somente a cor do dashboard","Topologia, compatibilidade, cobertura e requisitos operacionais","O nome do DBA","A quantidade de tabelas apenas"],answer:1
},
{
 objective:"Realizar o onboarding lógico de uma fonte de dados.",
 concept:"Cadastrar um ativo envolve identidade, endereço, tecnologia, grupo, criticidade, credenciais quando aplicável e teste de conectividade.",
 expected:"Concluir cadastro com validação e tratamento de falhas.",
 procedure:["Informar nome lógico, tipo e endereço da fonte.","Associar grupo, proprietário e criticidade.","Selecionar método de monitoramento.","Executar descoberta e teste de conectividade.","Confirmar o ativo como protegido."],
 scenarios:[
  ["success","SUCESSO","Oracle cadastrado","ORCLPRD foi validado e marcado como protegido.","Onboarding","ORCLPRD","PROTECTED","Eventos já estão sendo recebidos."],
  ["alert","ALERTA","Ativo sem proprietário","A fonte foi cadastrada sem responsável definido.","Governance","SQLPROD01","WARNING","Atribua um owner para tratamento de riscos."],
  ["error","ERRO","Teste de conexão falhou","A porta configurada não respondeu.","Connectivity","1521/TCP","ERROR","Valide listener, rede e firewall."],
  ["info","INFORMAÇÃO","Tags aplicadas","Produção, Financeiro e LGPD foram associadas.","Asset Tags","ORCLPRD","UPDATED","Filtros e relatórios poderão usar as tags."]
 ],
 question:"Qual etapa confirma que a fonte está pronta para monitoramento?",
 options:["Alterar a senha do SYS","Validar conectividade, cobertura e recebimento de eventos","Recriar o banco","Excluir o listener"],answer:1
},
{
 objective:"Monitorar sessões, comandos e objetos em Oracle Database.",
 concept:"Eventos Oracle podem incluir SELECT, DML, DDL, DCL, autenticação e atividades de SYS, SYSTEM ou contas de aplicação.",
 expected:"Interpretar um evento Oracle com usuário, origem, objeto, comando e severidade.",
 procedure:["Abrir uma sessão Oracle monitorada.","Executar uma consulta permitida.","Executar uma operação privilegiada.","Comparar o resultado das políticas.","Registrar a evidência da atividade."],
 scenarios:[
  ["success","SUCESSO","SELECT autorizado","APP_REPORT consultou uma view permitida.","Oracle Activity","APP_REPORT","ALLOWED","Evento classificado como rotina."],
  ["alert","ALERTA","GRANT DBA","SYSTEM concedeu DBA a uma conta de aplicação.","Privilege Escalation","APP_FIN","CRITICAL","Alerta imediato encaminhado ao SOC."],
  ["error","ERRO","Objeto não resolvido","O sinônimo consultado não foi associado ao objeto-base.","Object Resolution","SYN_CLIENTES","ERROR","Atualize metadados e execute nova descoberta."],
  ["info","INFORMAÇÃO","Sessão correlacionada","A conexão foi associada ao servidor de aplicação.","Session Context","JDBC","IDENTIFIED","A origem lógica foi enriquecida."]
 ],
 question:"Qual operação Oracle representa uma possível escalação de privilégio?",
 options:["SELECT SYSDATE FROM DUAL","GRANT DBA TO APP_FIN","COMMIT","ALTER SESSION SET NLS_DATE_FORMAT"],answer:1
},
{
 objective:"Criar e validar políticas específicas para riscos Oracle.",
 concept:"Políticas podem considerar usuário, comando, objeto, horário, origem, volume e classificação de dados.",
 expected:"Identificar quando uma regra deve alertar, permitir ou exigir correção.",
 procedure:["Selecionar ativos Oracle de produção.","Definir usuários privilegiados monitorados.","Criar condição para GRANT DBA e acesso a SYS.","Definir severidade e destino do alerta.","Executar testes positivos e negativos."],
 scenarios:[
  ["success","SUCESSO","Teste negativo aprovado","Uma consulta permitida não gerou violação.","Policy Test","ORACLE-POL-01","PASS","A regra não produz falso positivo neste cenário."],
  ["alert","ALERTA","SYS fora da janela","Atividade SYS ocorreu às 02:18.","Privileged Off-hours","SYS","HIGH","Violação registrada."],
  ["error","ERRO","Política sem escopo","Nenhuma fonte Oracle foi associada à regra.","Policy Scope","ORACLE-POL-02","ERROR","Selecione ativos ou grupos antes de publicar."],
  ["info","INFORMAÇÃO","Exceção aprovada","Janela de manutenção foi adicionada temporariamente.","Exception","CHG-4821","ACTIVE","A exceção possui expiração automática."]
 ],
 question:"Uma política Oracle eficaz pode combinar quais critérios?",
 options:["Usuário, operação, objeto, horário e origem","Somente nome do servidor","Apenas tamanho do SGA","Somente versão do Linux"],answer:0
},
{
 objective:"Monitorar logins, comandos T-SQL, roles e objetos SQL Server.",
 concept:"A análise inclui autenticação, SELECT, DDL, DML, server roles, database roles e contexto da aplicação.",
 expected:"Distinguir atividade comum de operação administrativa crítica.",
 procedure:["Conectar ao SQLPROD01 com login monitorado.","Executar consulta de rotina.","Executar alteração em server role.","Analisar usuário, host, aplicação e objeto.","Confirmar a política acionada."],
 scenarios:[
  ["success","SUCESSO","Consulta de relatório","report_user consultou uma view autorizada.","SQL Activity","report_user","ALLOWED","Atividade dentro do baseline."],
  ["alert","ALERTA","ADD MEMBER SYSADMIN","sa adicionou um login à server role sysadmin.","Privilege Escalation","app_financeiro","CRITICAL","Incidente criado."],
  ["error","ERRO","Contexto da aplicação ausente","O client program name não foi enviado.","Session Context","CLIENT APP","ERROR","Revise string de conexão ou enriquecimento."],
  ["info","INFORMAÇÃO","Login mapeado","O login foi associado ao proprietário da aplicação.","Identity","app_api","MAPPED","Responsável disponível para investigação."]
 ],
 question:"Qual operação SQL Server é considerada crítica?",
 options:["SELECT GETDATE()","ALTER SERVER ROLE sysadmin ADD MEMBER app_financeiro","USE master","COMMIT"],answer:1
},
{
 objective:"Aplicar políticas específicas para SQL Server.",
 concept:"Controles podem monitorar sa, sysadmin, falhas de login, alterações de schema, acesso a tabelas críticas e extração massiva.",
 expected:"Testar política com sucesso, alerta, erro de configuração e informação.",
 procedure:["Definir grupo SQL Server Production.","Criar regra para ALTER SERVER ROLE sysadmin.","Adicionar condição de origem e janela.","Selecionar severidade crítica.","Executar teste e revisar evidências."],
 scenarios:[
  ["success","SUCESSO","Regra validada","A operação permitida ficou fora da violação.","Policy Test","MSSQL-POL-01","PASS","Critérios funcionando corretamente."],
  ["alert","ALERTA","Uso da conta sa","A conta sa acessou tabela financeira diretamente.","Privileged Login","sa","HIGH","Uso administrativo requer investigação."],
  ["error","ERRO","Expressão inválida","A condição da política não pôde ser compilada.","Policy Syntax","MSSQL-POL-02","ERROR","Corrija operador e campo selecionado."],
  ["info","INFORMAÇÃO","Baseline criado","Volume normal do login report_user foi calculado.","Behavior","report_user","READY","Desvios futuros serão comparados."]
 ],
 question:"Qual conta SQL Server merece monitoramento privilegiado especial?",
 options:["sa","guest somente por existir","Qualquer tabela vazia","O nome do database"],answer:0
},
{
 objective:"Descobrir e classificar dados sensíveis nos bancos.",
 concept:"Classificação identifica categorias como CPF, cartão, e-mail, dados financeiros e outras informações reguladas.",
 expected:"Entender descoberta, confirmação, falso positivo e cobertura.",
 procedure:["Selecionar fontes para varredura.","Executar descoberta de schemas e colunas.","Aplicar classificadores por nome e conteúdo.","Revisar resultados e confirmar categorias.","Publicar classificação para uso nas políticas."],
 scenarios:[
  ["success","SUCESSO","CPF identificado","A coluna CLIENTES.CPF foi classificada.","Discovery","CPF","CONFIRMED","Classificação publicada."],
  ["alert","ALERTA","Cartão sem proteção","Uma coluna de cartão foi encontrada fora do schema esperado.","Sensitive Data","CARD_NUMBER","HIGH","Risco encaminhado para remediação."],
  ["error","ERRO","Permissão insuficiente","A conta de discovery não pôde ler metadados.","Discovery Account","METADATA","ERROR","Conceda somente os privilégios necessários."],
  ["info","INFORMAÇÃO","Falso positivo removido","A coluna CODIGO_EMAIL não contém endereços reais.","Classification Review","CODIGO_EMAIL","EXCLUDED","O classificador foi refinado."]
 ],
 question:"Qual é o objetivo da classificação de dados?",
 options:["Aumentar o tamanho das tabelas","Identificar e categorizar informações sensíveis para aplicar controles adequados","Substituir índices","Criar usuários DBA"],answer:1
},
{
 objective:"Acompanhar atividades de usuários com alto nível de privilégio.",
 concept:"Contas administrativas exigem contexto, justificativa, horário, origem e trilha independente.",
 expected:"Reconhecer uso autorizado, comportamento suspeito, falha de identidade e informação de governança.",
 procedure:["Cadastrar contas privilegiadas conhecidas.","Associar owner e função de cada conta.","Definir janelas e origens autorizadas.","Monitorar comandos críticos.","Revisar exceções e contas compartilhadas."],
 scenarios:[
  ["success","SUCESSO","Manutenção autorizada","DBA_SUPORTE atuou dentro da mudança aprovada.","Privileged Access","CHG-4821","AUTHORIZED","Atividade auditada sem violação."],
  ["alert","ALERTA","Conta compartilhada","SYSTEM apareceu simultaneamente em duas origens.","Shared Account","SYSTEM","HIGH","Identidade real deve ser investigada."],
  ["error","ERRO","Owner desconhecido","Uma conta privilegiada não possui responsável.","Governance","DBA_TEMP","ERROR","A conta deve ser regularizada ou bloqueada."],
  ["info","INFORMAÇÃO","Recertificação pendente","A revisão trimestral de acessos foi iniciada.","Access Review","Q3-2026","OPEN","Gestores receberam solicitação."]
 ],
 question:"Por que contas compartilhadas dificultam a auditoria?",
 options:["Porque aumentam o espaço em disco","Porque dificultam atribuir a atividade a uma pessoa específica","Porque impedem SELECT","Porque desativam o listener"],answer:1
},
{
 objective:"Construir políticas com critérios e ações coerentes.",
 concept:"Uma política deve ter escopo, condição, exceção controlada, severidade, resposta e responsável.",
 expected:"Publicar uma regra precisa sem falso positivo excessivo.",
 procedure:["Definir o risco que será controlado.","Selecionar fontes, usuários, objetos e operações.","Adicionar contexto de horário, origem e volume.","Configurar severidade e ações.","Testar cenários positivos e negativos antes de publicar."],
 scenarios:[
  ["success","SUCESSO","Política precisa","Os testes positivo e negativo foram aprovados.","Policy Quality","POL-2201","READY","Regra liberada para produção."],
  ["alert","ALERTA","Muitos falsos positivos","A regra gerou 4.200 alertas de baixo valor.","Policy Tuning","POL-2202","WARNING","Refine escopo e baseline."],
  ["error","ERRO","Sem ação definida","A violação não possui destino ou workflow.","Policy Action","POL-2203","ERROR","Configure alerta, relatório ou integração."],
  ["info","INFORMAÇÃO","Versão criada","A alteração foi salva como nova revisão.","Policy Version","V3","SAVED","Histórico preservado para auditoria."]
 ],
 question:"O que deve ocorrer antes da publicação de uma política?",
 options:["Testes positivos e negativos","Excluir os eventos antigos","Parar todos os bancos","Remover os usuários privilegiados"],answer:0
},
{
 objective:"Priorizar, encaminhar e tratar alertas e violações.",
 concept:"Severidade, risco, contexto e repetição orientam o workflow de resposta.",
 expected:"Diferenciar evento, alerta, incidente e erro de entrega.",
 procedure:["Receber uma violação de política.","Calcular severidade e risco.","Enriquecer com usuário, ativo e dados sensíveis.","Encaminhar para fila ou integração.","Registrar decisão e encerramento."],
 scenarios:[
  ["success","SUCESSO","Alerta entregue","O SOC recebeu a notificação crítica.","Notification","SOC QUEUE","DELIVERED","SLA iniciado."],
  ["alert","ALERTA","Incidente correlacionado","Três violações do mesmo usuário foram agrupadas.","Correlation","INC-481","CRITICAL","Investigação priorizada."],
  ["error","ERRO","Falha no e-mail","O canal SMTP não confirmou entrega.","Notification","EMAIL","ERROR","O canal alternativo SIEM permaneceu ativo."],
  ["info","INFORMAÇÃO","SLA atualizado","O incidente foi atribuído ao time de segurança.","Workflow","DB SECURITY","ASSIGNED","Responsável e prazo registrados."]
 ],
 question:"Quando múltiplas violações relacionadas são agrupadas, o resultado normalmente é:",
 options:["Um incidente correlacionado","Um backup completo","Um novo datafile","Uma atualização do sistema operacional"],answer:0
},
{
 objective:"Investigar incidentes correlacionando evidências técnicas e comportamentais.",
 concept:"A investigação reúne linha do tempo, usuário, origem, objetos, volume, baseline, políticas e contexto de negócio.",
 expected:"Chegar a uma decisão fundamentada e documentada.",
 procedure:["Abrir o incidente de maior risco.","Revisar linha do tempo e evidências.","Comparar atividade com baseline e mudança aprovada.","Consultar owner e contexto da aplicação.","Classificar como legítimo, suspeito ou confirmado.","Registrar ação de contenção ou encerramento."],
 scenarios:[
  ["success","SUCESSO","Atividade legítima","A extração estava vinculada a processo aprovado.","Investigation","CHG-4902","CLOSED","Evidências e justificativa registradas."],
  ["alert","ALERTA","Exfiltração provável","Volume, horário e origem divergiram do baseline.","Risk Analysis","APP_BATCH","CRITICAL","Contenção recomendada."],
  ["error","ERRO","Evidência incompleta","O identificador da aplicação não foi capturado.","Evidence Quality","CLIENT ID","ERROR","Colete contexto adicional antes da decisão."],
  ["info","INFORMAÇÃO","Owner consultado","O responsável informou que não havia execução prevista.","Business Context","APP OWNER","RECEIVED","Risco elevado pela ausência de justificativa."]
 ],
 question:"Qual conjunto oferece a investigação mais completa?",
 options:["Somente o texto SQL","Linha do tempo, usuário, origem, objeto, volume, baseline e contexto de negócio","Apenas o nome do banco","Somente a versão do sistema operacional"],answer:1
},
{
 objective:"Produzir trilha de auditoria e relatórios úteis para segurança e conformidade.",
 concept:"Relatórios devem demonstrar quem fez o quê, quando, onde, em qual dado e qual política foi aplicada.",
 expected:"Gerar relatório íntegro, útil e com escopo correto.",
 procedure:["Definir objetivo e público do relatório.","Selecionar período, ativos e políticas.","Incluir eventos, decisões e evidências.","Validar retenção e integridade.","Agendar distribuição segura."],
 scenarios:[
  ["success","SUCESSO","Relatório gerado","O relatório de usuários privilegiados foi concluído.","Reporting","PRIVILEGED-Q3","READY","Arquivo disponível para auditoria."],
  ["alert","ALERTA","Violação recorrente","O relatório mostrou repetição semanal do mesmo risco.","Compliance Trend","POL-1004","HIGH","Plano de remediação solicitado."],
  ["error","ERRO","Período sem dados","O filtro selecionado ficou fora da retenção disponível.","Reporting","DATE RANGE","ERROR","Ajuste o período ou consulte arquivo externo."],
  ["info","INFORMAÇÃO","Entrega agendada","O relatório será enviado mensalmente.","Schedule","MONTHLY","ACTIVE","Destinatários validados."]
 ],
 question:"Uma boa trilha de auditoria deve responder principalmente:",
 options:["Quem fez o quê, quando, onde e em qual dado","Somente qual é a versão do banco","Apenas quanto espaço existe","Somente o nome do servidor"],answer:0
},
{
 objective:"Integrar eventos de segurança com SIEM e processos de resposta.",
 concept:"Integrações permitem correlação corporativa, abertura de tickets, automação e visibilidade do SOC.",
 expected:"Validar entrega, falha, alerta e informação de integração.",
 procedure:["Definir destino e formato de eventos.","Configurar autenticação e transporte seguro.","Mapear campos de severidade, ativo e usuário.","Executar teste de envio.","Validar deduplicação e tratamento de falhas."],
 scenarios:[
  ["success","SUCESSO","Evento entregue ao SIEM","A mensagem foi aceita e correlacionada.","SIEM Integration","EVENT-9201","ACKNOWLEDGED","Integração operacional."],
  ["alert","ALERTA","Regra corporativa acionada","O SIEM correlacionou banco, endpoint e identidade.","Correlation","USE CASE 44","CRITICAL","Caso enviado ao SOC."],
  ["error","ERRO","Token expirado","A integração recusou autenticação.","Integration Auth","API TOKEN","ERROR","Renove a credencial e teste novamente."],
  ["info","INFORMAÇÃO","Ticket criado","O workflow abriu uma ocorrência no ITSM.","Automation","INC001482","CREATED","SLA corporativo iniciado."]
 ],
 question:"Qual é uma finalidade típica da integração com SIEM?",
 options:["Correlacionar eventos de várias fontes e apoiar o SOC","Criar tablespaces","Executar RMAN","Trocar a versão do banco"],answer:0
},
{
 objective:"Diagnosticar problemas de coleta, comunicação, cobertura e qualidade dos eventos.",
 concept:"Troubleshooting deve seguir camadas: fonte, método de coleta, agente, rede, Gateway, registro e política.",
 expected:"Resolver falhas sem perder a sequência lógica de análise.",
 procedure:["Confirmar que o banco e a fonte estão disponíveis.","Verificar processo, heartbeat e logs do coletor.","Testar rede, portas e certificados.","Revisar filas e saúde do Gateway.","Validar chegada e normalização de um evento de teste."],
 scenarios:[
  ["success","SUCESSO","Coleta restaurada","O agente voltou a enviar heartbeat e eventos.","Troubleshooting","ora-db01","HEALTHY","Incidente técnico encerrado."],
  ["alert","ALERTA","Fila em crescimento","O volume recebido excede a taxa de processamento.","Capacity","GW-01","WARNING","Avalie recursos e dimensionamento."],
  ["error","ERRO","Certificado expirado","A comunicação segura foi rejeitada.","TLS","CERTIFICATE","ERROR","Renove e redistribua o certificado."],
  ["info","INFORMAÇÃO","Diagnóstico coletado","Logs e métricas foram anexados ao chamado.","Support Bundle","CASE-8821","READY","Evidências disponíveis para análise."]
 ],
 question:"Qual sequência de troubleshooting é mais adequada?",
 options:["Fonte, coleta/agente, rede, Gateway e validação de evento","Excluir todas as políticas imediatamente","Reinstalar o banco sem diagnóstico","Trocar todas as senhas"],answer:0
},
{
 objective:"Executar uma investigação completa reunindo os conhecimentos da trilha.",
 concept:"O projeto final combina descoberta, monitoramento, política, alerta, investigação, resposta e relatório.",
 expected:"Concluir um incidente simulado com evidências e decisão documentada.",
 procedure:["Analisar o alerta de extração massiva em ORCLPRD.","Confirmar que os dados acessados são sensíveis.","Revisar usuário, origem, horário e baseline.","Correlacionar com mudanças e owner da aplicação.","Definir severidade e decisão.","Simular contenção e gerar relatório final."],
 scenarios:[
  ["success","SUCESSO","Fluxo completo validado","Todas as etapas do projeto foram executadas.","Final Project","CASE-481","COMPLETED","Evidências preservadas e relatório emitido."],
  ["alert","ALERTA","Exfiltração confirmada","A atividade não possui justificativa e excede o baseline.","Final Incident","APP_BATCH","CRITICAL","Contenção e escalonamento aprovados."],
  ["error","ERRO","Decisão sem evidência","O analista tentou encerrar sem registrar justificativa.","Case Governance","CASE-481","ERROR","Adicione evidências e decisão antes do encerramento."],
  ["info","INFORMAÇÃO","Relatório executivo pronto","Resumo, impacto e recomendações foram consolidados.","Final Report","RPT-481","READY","Material disponível para apresentação."]
 ],
 question:"O projeto final deve terminar com:",
 options:["Uma decisão documentada, evidências e relatório","A exclusão dos bancos","Somente um print da tela","Nenhuma ação registrada"],answer:0
}
];

let currentModuleIndex = null;
let currentActivity = {lesson:false,scenarios:new Set(),validated:false};

function renderActivitySteps(step){
 const labels=[
  ["01","Aprendizado","Conteúdo e procedimento"],
  ["02","Simulações","Sucesso, alerta, erro e info"],
  ["03","Validação","Questão do módulo"],
  ["04","Conclusão","Registro do progresso"]
 ];
 $("#activitySteps").innerHTML=labels.map((x,i)=>{
   const pos=i+1;
   const cls=pos<step?"done":pos===step?"active":"";
   return `<div class="activity-step ${cls}"><i>${pos<step?"✓":x[0]}</i><div><b>${x[1]}</b><small>${x[2]}</small></div></div>`;
 }).join("");
 const progress=[0,25,75,90,100][step]||0;
 $("#activityProgressBar").style.width=progress+"%";
 $("#activityProgressText").textContent=step===1?"0 de 4 etapas":step===2?`${currentActivity.scenarios.size} de 4 cenários`:step===3?"3 de 4 etapas":step===4?"4 de 4 etapas":"0 de 4 etapas";
}

function showActivityPanel(name){
 ["lessonPanel","scenarioPanel","validationPanel","completionPanel"].forEach(id=>$("#"+id).classList.add("hidden"));
 $("#"+name).classList.remove("hidden");
}

function openModuleActivity(index){
 currentModuleIndex=index;
 currentActivity={lesson:false,scenarios:new Set(),validated:false};
 const m=modules[index], a=moduleActivities[index];
 $("#activityCategory").textContent=`MÓDULO ${String(index+1).padStart(2,"0")} · ${m[0]}`;
 $("#activityTitle").textContent=m[1];
 $("#activitySubtitle").textContent=m[2];
 $("#lessonNumber").textContent=String(index+1).padStart(2,"0");
 $("#lessonTitle").textContent=m[1];
 $("#lessonDescription").textContent=m[2];
 $("#lessonObjective").textContent=a.objective;
 $("#lessonConcept").textContent=a.concept;
 $("#lessonExpected").textContent=a.expected;
 $("#procedureList").innerHTML=a.procedure.map(x=>`<li>${x}</li>`).join("");
 $("#moduleScenarioGrid").innerHTML=a.scenarios.map((s,i)=>`
  <button class="module-scenario ${s[0]}" data-activity-scenario="${i}">
    <span class="scenario-type">${s[1]}</span>
    <h4>${s[2]}</h4>
    <p>${s[3]}</p>
    <footer>Executar cenário →</footer>
  </button>`).join("");
 $("#scenarioConsoleBody").innerHTML='<div class="console-empty"><div>⌁</div><h4>Aguardando execução</h4><p>Selecione um cenário para visualizar a análise.</p></div>';
 $("#scenarioConsoleStatus").textContent="READY";
 $("#scenarioCounter").textContent="0/4 executados";
 $("#goValidationBtn").classList.add("hidden");
 $("#validationQuestion").textContent=a.question;
 $("#validationOptions").innerHTML=a.options.map((o,i)=>`<label class="validation-option"><input type="radio" name="moduleValidation" value="${i}">${o}</label>`).join("");
 $("#validationFeedback").className="validation-feedback hidden";
 $("#completionTitle").textContent=m[1];
 showActivityPanel("lessonPanel");
 renderActivitySteps(1);
 $("#moduleModal").classList.remove("hidden");
 document.body.style.overflow="hidden";
}

function closeModuleActivity(){
 $("#moduleModal").classList.add("hidden");
 document.body.style.overflow="";
 currentModuleIndex=null;
}

function executeActivityScenario(index){
 const a=moduleActivities[currentModuleIndex], s=a.scenarios[index];
 const card=$(`[data-activity-scenario="${index}"]`);
 card.classList.add("executed");
 currentActivity.scenarios.add(index);
 $("#scenarioCounter").textContent=`${currentActivity.scenarios.size}/4 executados`;
 $("#activityProgressText").textContent=`${currentActivity.scenarios.size} de 4 cenários`;
 $("#activityProgressBar").style.width=(25+currentActivity.scenarios.size*12.5)+"%";
 $("#scenarioConsoleStatus").textContent="PROCESSING...";
 setTimeout(()=>{
   $("#scenarioConsoleStatus").textContent=s[1];
   $("#scenarioConsoleBody").innerHTML=`
    <div class="console-result-head ${s[0]}">
      <div><span>${s[1]}</span><br><b>${s[2]}</b></div>
      <strong>${s[6]}</strong>
    </div>
    <div class="console-lines">
      <span>Module<b>${String(currentModuleIndex+1).padStart(2,"0")} · ${modules[currentModuleIndex][1]}</b></span>
      <span>Analyzer<b>${s[4]}</b></span>
      <span>Target / Subject<b>${s[5]}</b></span>
      <span>Result<b>${s[6]}</b></span>
    </div>
    <div class="console-log">[START] Activity received
[ANALYZE] ${s[3]}
[POLICY] ${s[4]}
[RESULT] ${s[6]}
[ACTION] ${s[7]}</div>`;
   toast(`${s[1]}: ${s[2]}`,s[0]==="error"||s[0]==="alert"?"danger":"success");
   if(currentActivity.scenarios.size===4)$("#goValidationBtn").classList.remove("hidden");
 },450);
}

function validateCurrentModule(){
 const selected=$('input[name="moduleValidation"]:checked');
 const feedback=$("#validationFeedback");
 if(!selected){
   feedback.textContent="Selecione uma alternativa antes de validar.";
   feedback.className="validation-feedback error";
   return;
 }
 const a=moduleActivities[currentModuleIndex];
 if(Number(selected.value)!==a.answer){
   feedback.textContent="Resposta incorreta. Revise o objetivo e os resultados das simulações antes de tentar novamente.";
   feedback.className="validation-feedback error";
   return;
 }
 currentActivity.validated=true;
 feedback.textContent="Resposta correta. O conteúdo e as simulações foram validados com sucesso.";
 feedback.className="validation-feedback success";
 setTimeout(()=>{
   showActivityPanel("completionPanel");
   renderActivitySteps(4);
 },650);
}

function finishCurrentModule(){
 const i=currentModuleIndex;
 if(!state.completed.includes(i)){
   state.completed.push(i);
   state.completed.sort((a,b)=>a-b);
   localStorage.setItem("impervaModulesV020",JSON.stringify(state.completed));
 }
 closeModuleActivity();
 renderModules();
 updateProgress();
 updateCertificate();
 toast(`Módulo ${i+1} concluído após todas as atividades!`);
}


function setPolicyTab(n){$$("#policyTabs button").forEach(b=>b.classList.toggle("active",b.dataset.policyTab===n));$$(".policy-tab-panel").forEach(p=>p.classList.remove("active"));$(`#policy-tab-${n}`).classList.add("active")}
function openPolicyStudio(i){currentPolicyIndex=i;currentPolicySeverity=policies[i][2];const p=policies[i],d=policyDetails[i],a=localStorage.getItem(`policy${i}`)!=="off";$("#policyStudioTitle").textContent=p[0];$("#policyStudioDescription").textContent=p[1];$("#policyStudioStatus").textContent=a?"ACTIVE":"DISABLED";$("#policyNameInput").value=p[0];$("#policyCategoryInput").value=d.cat;$("#policyDescriptionInput").value=p[1];$$("#policySeveritySelector button").forEach(b=>b.classList.toggle("selected",b.dataset.severity===p[2]));$("#scopeOracle").checked=d.db.includes("Oracle");$("#scopeSqlServer").checked=d.db.includes("SQL Server");$("#policyUsersInput").value=d.users;$("#policyObjectsInput").value=d.objects;$("#policyOperationsInput").value=d.ops;$("#policyWindowInput").value=d.win;$$("#policyActionChecks input").forEach(c=>c.checked=["alert","siem","incident","email"].includes(c.value));$("#policyPreviewName").textContent=p[0];$("#policyPreviewSeverity").textContent=p[2];$("#policyPreviewDatabase").textContent=d.db;$("#policyPreviewTriggers").textContent=(i+1)*2;$("#policySimulationDb").textContent=d.db.toUpperCase();$("#policySimulationCommand").textContent=d.cmd;resetPolicySimulation();renderPolicyExplanation();renderPolicyPlaybook();setPolicyTab("editor");$("#policyStudioModal").classList.remove("hidden");document.body.style.overflow="hidden"}
function closePolicyStudio(){$("#policyStudioModal").classList.add("hidden");document.body.style.overflow=""}
function resetPolicySimulation(){$("#policyExecutionStatus").textContent="READY";$("#policyResultBody").innerHTML='<div class="console-empty"><div>⌁</div><h4>Aguardando execução</h4><p>Execute o teste para visualizar o resultado.</p></div>';["policyMatchMetric","policyRiskMetric","policyIncidentMetric","policySiemMetric"].forEach(id=>$("#"+id).textContent="--");$("#policyTimeline").innerHTML="";$("#policyLogsOutput").textContent="Nenhuma execução registrada."}
function runCurrentPolicySimulation(){const p=policies[currentPolicyIndex],d=policyDetails[currentPolicyIndex];$("#policyExecutionStatus").textContent="PROCESSING...";setTimeout(()=>{$("#policyExecutionStatus").textContent="VIOLATION DETECTED";$("#policyResultBody").innerHTML=`<div class="policy-execution-banner"><div><span>POLICY EXECUTION</span><br><strong>${p[0]}</strong></div><b class="severity ${currentPolicySeverity}">${currentPolicySeverity}</b></div><div class="policy-execution-grid"><span>Database<b>${d.db}</b></span><span>User<b>${d.user}</b></span><span>Source IP<b>${d.origin}</b></span><span>Target<b>${d.target}</b></span><span>Policy Match<b>TRUE</b></span><span>Risk Score<b>${d.risk}/100</b></span></div><div class="policy-execution-actions">ALERT GENERATED
INCIDENT CREATED: ${d.inc}
EMAIL SENT
SIEM EVENT FORWARDED</div>`;$("#policyMatchMetric").textContent="TRUE";$("#policyRiskMetric").textContent=d.risk+"/100";$("#policyIncidentMetric").textContent=d.inc;$("#policySiemMetric").textContent="SENT";buildPolicyTimeline();buildPolicyLogs();toast("Política acionada com sucesso.","danger")},600)}
function buildPolicyTimeline(){const p=policies[currentPolicyIndex],d=policyDetails[currentPolicyIndex],x=[["22:17:02","Conexão identificada",d.user],["22:17:06","Atividade capturada",d.cmd.split("\n")[0]],["22:17:07","Policy match",p[0]],["22:17:08","Alerta "+currentPolicySeverity,"Risk score "+d.risk],["22:17:09","Incidente criado",d.inc],["22:17:10","SIEM notificado","Evento enviado ao SOC"]];$("#policyTimeline").innerHTML=x.map((a,i)=>`<div class="policy-timeline-item ${i>=3?"alert":""}"><time>${a[0]}</time><div class="policy-timeline-marker"><i></i></div><div class="policy-timeline-content"><b>${a[1]}</b><span>${a[2]}</span></div></div>`).join("");$("#policyTimelineIncident").textContent=d.inc}
function buildPolicyLogs(){const p=policies[currentPolicyIndex],d=policyDetails[currentPolicyIndex];$("#policyLogsOutput").textContent=`22:17:02 [CONNECTION] user=${d.user} source=${d.origin}
22:17:06 [ACTIVITY] target=${d.target}
22:17:07 [POLICY_MATCH] policy=${p[0]} result=true
22:17:08 [RISK] severity=${currentPolicySeverity} score=${d.risk}
22:17:09 [INCIDENT] id=${d.inc} status=OPEN
22:17:10 [SIEM] delivery=SUCCESS`}
function renderPolicyExplanation(){const p=policies[currentPolicyIndex],d=policyDetails[currentPolicyIndex];$("#policyWhyTitle").textContent=p[0];$("#policyWhyText").textContent=d.why;$("#policyImpactTitle").textContent=d.cat;$("#policyImpactText").textContent=d.impact;$("#policyExplanationFacts").innerHTML=d.facts.map(f=>`<span>${f[0]}<b>${f[1]}</b></span>`).join("");$("#policyFinalSeverity").textContent=p[2];$("#policyFinalAction").textContent="INCIDENT CREATED"}
function renderPolicyPlaybook(){currentPlaybookDone=new Set();$("#policyPlaybookSteps").innerHTML=policyPlaybookDefault.map((x,i)=>`<label class="playbook-step" data-playbook-step="${i}"><input type="checkbox"><span><b>${i+1}. ${x[0]}</b><small>${x[1]}</small></span></label>`).join("");$("#policyRemediationList").innerHTML=policyRemediationDefault.map(x=>`<li>${x}</li>`).join("");$("#playbookProgress").textContent="0/5";$("#finishPlaybookBtn").classList.add("hidden")}


const investigationCases=[
 {id:"IMP-2026-00481",title:"Possível extração massiva de dados sensíveis",description:"Conta de aplicação acessou volume muito superior ao baseline fora da janela autorizada.",severity:"CRITICAL",risk:92,status:"OPEN",db:"ORCLPRD",host:"oracle-db01",user:"APP_BATCH",osUser:"oracle",ip:"192.168.20.34",program:"JDBC Thin Client",sql:"SELECT CPF, NOME, CARTAO, EMAIL\nFROM FINANCEIRO.CLIENTES;",rows:"185.430",sensitive:"CPF, CARD_NUMBER, EMAIL",plan:["TABLE ACCESS FULL","FILTER","SORT","RETURN"],objects:[["CLIENTES","CPF / EMAIL"],["CARTOES","CARD_NUMBER"],["USUARIOS","IDENTIDADE"]],factors:[["Behavior",35],["Sensitive Data",25],["Outside Baseline",20],["Time",12]],ai:"A conta APP_BATCH executou uma consulta massiva em dados sensíveis. O volume foi 1.847% superior ao baseline, ocorreu às 02:18 e não existe mudança aprovada. A origem é conhecida, porém o comportamento é incompatível com o histórico. Recomendação: validar imediatamente com o owner e aplicar contenção preventiva.",decision:"PENDENTE"},
 {id:"IMP-2026-00482",title:"Concessão de DBA não autorizada",description:"SYSTEM concedeu privilégio DBA a uma conta de aplicação.",severity:"CRITICAL",risk:96,status:"OPEN",db:"ORCLPRD",host:"oracle-db01",user:"SYSTEM",osUser:"oracle",ip:"192.168.10.22",program:"SQL*Plus",sql:"GRANT DBA TO APP_FINANCEIRO;",rows:"N/A",sensitive:"Privilégio administrativo",plan:["PARSE DCL","ROLE GRANT","AUDIT RECORD","ALERT"],objects:[["APP_FINANCEIRO","DBA ROLE"],["DBA_ROLE_PRIVS","METADATA"]],factors:[["Privilege",40],["Policy Match",25],["No Change",20],["User Risk",11]],ai:"A operação GRANT DBA fornece privilégios administrativos amplos a uma conta de aplicação. Não foi localizada mudança aprovada. Recomendação: revogar o privilégio, confirmar o executor e revisar a necessidade de acesso.",decision:"PENDENTE"},
 {id:"IMP-2026-00483",title:"Exclusão de objeto crítico",description:"Tabela de auditoria foi removida sem ticket associado.",severity:"CRITICAL",risk:97,status:"INVESTIGATING",db:"SQLPROD01",host:"sql-db01",user:"sa",osUser:"svc_sql",ip:"192.168.10.70",program:"SSMS",sql:"DROP TABLE Financeiro.dbo.AuditoriaClientes;",rows:"N/A",sensitive:"Audit trail",plan:["DDL REQUEST","OBJECT LOCK","DROP OBJECT","AUDIT EVENT"],objects:[["AuditoriaClientes","CRITICAL"],["Financeiro","DATABASE"]],factors:[["Destructive",45],["Critical Object",25],["No Change",18],["Privileged",9]],ai:"A conta sa removeu uma tabela crítica de auditoria. A atividade pode causar perda de evidências e impacto de conformidade. Recomendação: preservar logs, validar backup e iniciar recuperação do objeto.",decision:"PENDENTE"},
 {id:"IMP-2026-00484",title:"Falhas repetidas de autenticação",description:"Doze tentativas inválidas foram identificadas pela mesma origem.",severity:"MEDIUM",risk:72,status:"OPEN",db:"SQLPROD01",host:"sql-db01",user:"unknown",osUser:"unknown",ip:"172.16.5.91",program:"ODBC Client",sql:"-- 12 LOGIN FAILED events",rows:"12 tentativas",sensitive:"Nenhum",plan:["LOGIN REQUEST","AUTHENTICATION","DENY","RETRY"],objects:[["SQLPROD01","LOGIN ENDPOINT"]],factors:[["Repetition",30],["Unknown Source",20],["Authentication",15],["Time",7]],ai:"As falhas podem indicar credencial expirada em aplicação ou tentativa de força bruta. Recomendação: identificar a origem, verificar serviços e aplicar bloqueio se não for um ativo conhecido.",decision:"PENDENTE"}
];
let currentCaseIndex=null,currentCasePlaybook=new Set(),containmentHistory=[];
function updateInvestigationKpis(){if(!$('#openIncidentKpi'))return;const open=investigationCases.filter(c=>c.status!=='COMPLETED').length,critical=investigationCases.filter(c=>c.status!=='COMPLETED'&&c.severity==='CRITICAL').length,avg=Math.round(investigationCases.reduce((s,c)=>s+c.risk,0)/investigationCases.length);$('#openIncidentKpi').textContent=open;$('#criticalIncidentKpi').textContent=`${critical} críticos`;$('#averageRiskKpi').textContent=avg}
let incidentSimulationRunning=false;
const incidentSimulationTemplates=[
 {title:'Acesso sensível por origem desconhecida',description:'Uma conta de relatório acessou CPF e cartão a partir de um endereço não autorizado.',db:'ORCLPRD',host:'oracle-db01',user:'REPORT_EXT',osUser:'appsvc',ip:'203.0.113.77',program:'JDBC Thin Client',severity:'HIGH',risk:87,sql:'SELECT cpf, cartao, email\nFROM financeiro.clientes;',rows:'6.842',sensitive:'CPF, CARD_NUMBER, EMAIL',objects:[['FINANCEIRO.CLIENTES','Sensitive'],['CPF','Classified'],['CARD_NUMBER','Classified']],factors:[['Sensitive Data',92],['Unknown Source',88],['Behavior Deviation',81],['Volume',74]],plan:['TABLE ACCESS FULL','FILTER','RETURN'],ai:'A conta REPORT_EXT acessou dados pessoais a partir de uma origem fora da allowlist. O volume está acima do baseline e não existe mudança registrada.'},
 {title:'Execução de xp_cmdshell detectada',description:'A conta sa executou um comando do sistema operacional no SQL Server.',db:'SQLPROD01',host:'sql-db01',user:'sa',osUser:'sqlsvc',ip:'192.168.10.70',program:'SQL Server Management Studio',severity:'CRITICAL',risk:99,sql:"EXEC xp_cmdshell 'whoami';",rows:'1 command',sensitive:'OS COMMAND',objects:[['xp_cmdshell','Critical'],['SQLPROD01','Production']],factors:[['Privileged User',98],['OS Command',100],['Production Asset',95],['Behavior Deviation',92]],plan:['EXECUTE PROCEDURE','OS SHELL','RETURN'],ai:'A execução de xp_cmdshell por sa cria risco direto de comprometimento do servidor. Recomenda-se contenção imediata e preservação de evidências.'},
 {title:'Desativação de auditoria Oracle',description:'Uma conta administrativa alterou a configuração de auditoria no ambiente de produção.',db:'ORCLPRD',host:'oracle-db01',user:'SYS',osUser:'oracle',ip:'192.168.10.21',program:'SQL*Plus',severity:'CRITICAL',risk:97,sql:'NOAUDIT ALL;',rows:'N/A',sensitive:'AUDIT CONFIGURATION',objects:[['UNIFIED_AUDIT_TRAIL','Critical'],['AUDIT CONFIG','Changed']],factors:[['Audit Evasion',100],['Privileged User',98],['Production Asset',94],['No Change',96]],plan:['PARSE DCL','AUDIT CONFIG CHANGE','POLICY MATCH','ALERT'],ai:'A desativação de auditoria reduz a rastreabilidade das ações administrativas. É necessário validar imediatamente a mudança e restaurar a configuração.'},
 {title:'Backup SQL Server para destino não autorizado',description:'Um backup do banco financeiro foi direcionado para um compartilhamento externo não aprovado.',db:'SQLPROD01',host:'sql-db01',user:'backup_operator',osUser:'sqlsvc',ip:'192.168.10.75',program:'SQL Server Agent',severity:'HIGH',risk:91,sql:"BACKUP DATABASE Financeiro TO DISK='\\\\203.0.113.20\\share\\financeiro.bak';",rows:'1 backup',sensitive:'FULL DATABASE BACKUP',objects:[['Financeiro','Database'],['External Share','Unauthorized']],factors:[['Data Movement',94],['Unknown Destination',96],['Sensitive Database',90],['Privilege',82]],plan:['BACKUP REQUEST','DESTINATION CHECK','POLICY MATCH','SOC ALERT'],ai:'O backup contém dados financeiros completos e foi enviado para um destino não autorizado. Recomenda-se interromper a transferência e investigar a origem da solicitação.'},
 {title:'Criação de Database Link externo',description:'Um Database Link foi criado para uma origem não cadastrada no inventário corporativo.',db:'ORCLPRD',host:'oracle-db01',user:'DBA_APP',osUser:'oracle',ip:'192.168.10.31',program:'SQL Developer',severity:'HIGH',risk:89,sql:"CREATE DATABASE LINK EXT_LINK CONNECT TO ext_user IDENTIFIED BY *** USING 'EXTDB';",rows:'N/A',sensitive:'REMOTE DATABASE ACCESS',objects:[['EXT_LINK','Database Link'],['EXTDB','Unknown Target']],factors:[['External Connectivity',93],['Credential Exposure',88],['No Change',90],['Production Asset',85]],plan:['DDL PARSE','REMOTE TARGET CHECK','POLICY MATCH','INCIDENT'],ai:'O novo Database Link pode permitir movimentação não controlada de dados para um ambiente externo. A origem e a necessidade devem ser confirmadas.'},
 {title:'Concessão de IMPERSONATE no SQL Server',description:'Um login de aplicação recebeu permissão para assumir a identidade de outra conta.',db:'SQLPROD01',host:'sql-db01',user:'securityadmin',osUser:'sqlsvc',ip:'192.168.10.72',program:'SSMS',severity:'CRITICAL',risk:95,sql:'GRANT IMPERSONATE ON LOGIN::sa TO app_financeiro;',rows:'N/A',sensitive:'IDENTITY PRIVILEGE',objects:[['sa','Privileged Login'],['app_financeiro','Application Login']],factors:[['Identity Abuse',98],['Privilege Escalation',97],['Critical Account',96],['No Change',89]],plan:['GRANT REQUEST','IDENTITY ANALYSIS','POLICY MATCH','INCIDENT'],ai:'A permissão IMPERSONATE permite que a conta de aplicação execute ações em nome de um login privilegiado. Recomenda-se revogação imediata.'}
];
function simulateNewIncident(){
 if(incidentSimulationRunning){toast('A sequência de seis incidentes já está em execução.','danger');return}
 incidentSimulationRunning=true;
 const button=$('#newInvestigationBtn');
 button.disabled=true;button.textContent='Executando 0/6...';
 $('#newIncidentBanner').classList.remove('hidden');
 $('#newIncidentBannerTitle').textContent='Simulação completa do SOC Investigation Center';
 $('#newIncidentBannerText').textContent='Preparando seis cenários de segurança...';
 $('#incidentRunProgress').style.width='0%';
 let step=0;
 const runNext=()=>{
   if(step>=incidentSimulationTemplates.length){
     incidentSimulationRunning=false;
     button.disabled=false;button.textContent='↻ Reexecutar 6 incidentes';
     $('#newIncidentBannerTitle').textContent='✓ Seis incidentes simulados com sucesso';
     $('#newIncidentBannerText').textContent='Todos os casos foram adicionados à fila. Selecione qualquer incidente para investigar.';
     $('#incidentRunProgress').style.width='100%';
     toast('Sequência concluída: 6 incidentes disponíveis para investigação.');
     return;
   }
   const t=incidentSimulationTemplates[step];
   const seq=investigationCases.length+481;
   const c={id:`IMP-2026-00${seq}`,status:'OPEN',decision:'PENDENTE',...t};
   investigationCases.unshift(c);
   currentCaseIndex=0;
   renderIncidentList();updateInvestigationKpis();openCase(0);
   const current=step+1;
   button.textContent=`Executando ${current}/6...`;
   $('#newIncidentBannerTitle').textContent=`${current}/6 · ${c.severity}: ${c.title}`;
   $('#newIncidentBannerText').textContent=`${c.id} · ${c.db} · Risk Score ${c.risk}/100`;
   $('#incidentRunProgress').style.width=`${Math.round(current/6*100)}%`;
   $('#investigationCase').classList.add('incident-flash');
   setTimeout(()=>$('#investigationCase').classList.remove('incident-flash'),650);
   step++;
   setTimeout(runNext,1250);
 };
 runNext();
}
function renderIncidentList(){const box=$("#incidentList");box.innerHTML=investigationCases.map((c,i)=>`<article class="incident-card ${i===currentCaseIndex?"active":""}" data-case="${i}"><div class="incident-card-top"><span>${c.id}</span><span class="severity ${c.severity}">${c.severity}</span></div><h4>${c.title}</h4><p>${c.description}</p><div class="incident-card-foot"><span>${c.db}</span><span>${c.status}</span></div></article>`).join("")}
function openCase(i){currentCaseIndex=i;currentCasePlaybook=new Set();containmentHistory=[];const c=investigationCases[i];renderIncidentList();$("#investigationEmpty").classList.add("hidden");$("#investigationCase").classList.remove("hidden");$("#caseId").textContent="INCIDENTE #"+c.id;$("#caseTitle").textContent=c.title;$("#caseDescription").textContent=c.description;$("#caseSeverity").textContent=c.severity;$("#caseSeverity").className="severity "+c.severity;$("#caseRisk").textContent=c.risk;[["caseDb","db"],["caseHost","host"],["caseUser","user"],["caseOsUser","osUser"],["caseIp","ip"],["caseProgram","program"]].forEach(x=>$("#"+x[0]).textContent=c[x[1]]);$("#caseTimeline").innerHTML=[["02:17:41","Conexão iniciada",c.user+" via "+c.program,""],["02:18:44","Atividade capturada",c.sql.split("\n")[0],""],["02:18:47","Policy match",c.title,"alert"],["02:18:49","Alerta encaminhado","SIEM e SOC notificados",""]].map(x=>`<div class="${x[3]}"><time>${x[0]}</time><i></i><span><b>${x[1]}</b><small>${x[2]}</small></span></div>`).join("");$("#caseSql").textContent=c.sql;$("#caseSqlResult").innerHTML='<div class="console-empty"><div>⌁</div><h4>Aguardando execução</h4></div>';$("#casePlan").innerHTML=c.plan.map((x,j)=>`${j?'<i>→</i>':''}<span>${x}</span>`).join("");$("#caseUserFacts").innerHTML=`<div class="fact-list"><span>User<b>${c.user}</b></span><span>Last Login<b>02:17:41</b></span><span>Application<b>${c.program}</b></span><span>Status<b>ACTIVE</b></span><span>Privileged<b>${c.user==='SYSTEM'||c.user==='sa'?'YES':'NO'}</b></span></div>`;$("#caseNetwork").innerHTML=[c.ip,"Firewall","Database",c.db,"Imperva"].map((x,j)=>`${j?'<i>→</i>':''}<span>${x}</span>`).join("");$("#caseObjects").innerHTML=c.objects.map(x=>`<span>${x[0]}<b>${x[1]}</b></span>`).join("");$("#riskBig").textContent=c.risk;$("#riskLabel").textContent=c.severity+" RISK";$("#riskFactors").innerHTML=c.factors.map(x=>`<div class="risk-factor"><div class="risk-factor-head"><span>${x[0]}</span><b>${x[1]}%</b></div><div class="risk-factor-bar"><i style="width:${x[1]}%"></i></div></div>`).join("");$("#aiAnalysisOutput").classList.add("hidden");$("#containmentActions").innerHTML=[["Bloquear sessão","Interrompe a sessão monitorada"],["Revogar usuário","Remove privilégios do login"],["Desabilitar conta","Impede novas conexões"],["Abrir ticket","Cria ocorrência no ITSM"],["Enviar SIEM","Encaminha evento ao SOC"],["Enviar e-mail","Notifica responsáveis"]].map((x,j)=>`<button class="containment-action" data-contain="${j}"><b>${x[0]}</b><small>${x[1]}</small></button>`).join("");$("#containmentLog").textContent="Nenhuma ação executada.";$("#casePlaybookSteps").innerHTML=[["Confirmar usuário","Validar identidade e função da conta"],["Validar origem","Confirmar host, IP e aplicação"],["Analisar SQL","Revisar comando, objetos e volume"],["Comparar baseline","Verificar horário e comportamento histórico"],["Registrar decisão","Classificar e documentar o caso"]].map((x,j)=>`<label class="case-playbook-step" data-case-step="${j}"><input type="checkbox"><span><b>${j+1}. ${x[0]}</b><small>${x[1]}</small></span></label>`).join("");$("#casePlaybookProgress").textContent="0/5";$("#finishInvestigation").classList.add("hidden");$("#reportTitle").textContent=c.id+" — "+c.title;$("#reportBody").innerHTML=`<div class="report-grid"><span>Database<b>${c.db}</b></span><span>Usuário<b>${c.user}</b></span><span>Origem<b>${c.ip}</b></span><span>Risk Score<b>${c.risk}/100</b></span><span>SQL / Atividade<b>${c.sql.split("\n")[0]}</b></span><span>Dados sensíveis<b>${c.sensitive}</b></span></div>`;$("#reportDecision").textContent=c.decision;setCaseTab("summary")}
function setCaseTab(n){$$("#caseTabs button").forEach(b=>b.classList.toggle("active",b.dataset.caseTab===n));$$(".case-panel").forEach(p=>p.classList.remove("active"));$("#case-panel-"+n).classList.add("active")}
function runCaseSql(){const c=investigationCases[currentCaseIndex];$("#caseSqlResult").innerHTML='<div class="console-empty"><div class="pulse-icon">⌁</div><h4>Executando simulação...</h4></div>';setTimeout(()=>{$("#caseSqlResult").innerHTML=`<div class="sql-result-grid"><span>Rows<b>${c.rows}</b></span><span>Sensitive Data<b>${c.sensitive}</b></span><span>Policy Match<b>TRUE</b></span><span>Risk Score<b>${c.risk}/100</b></span></div>`;toast("Simulação SQL concluída.")},600)}
function runAiCase(){const c=investigationCases[currentCaseIndex],o=$("#aiAnalysisOutput");o.classList.remove("hidden");o.innerHTML='<div class="pulse-icon">✦</div><p>Analisando evidências, baseline e contexto...</p>';setTimeout(()=>o.innerHTML=`<h4>Resumo da análise</h4><p>${c.ai}</p><h4>Recomendação</h4><p>${c.risk>=90?'Prioridade imediata: iniciar contenção e escalonar ao SOC.':'Investigar a origem e confirmar a legitimidade antes do encerramento.'}</p>`,700)}




function incidentRoutingProfile(c){
 const isOracle=c.db.includes('ORCL'), isSql=c.db.includes('SQL');
 const title=(c.title||'').toLowerCase(), sql=(c.sql||'').toLowerCase();
 let category='Database Security Incident',department='Cyber Security / SOC',queue='SOC N2 — Database Security',support=isOracle?'DBA Oracle — Produção':'DBA SQL Server — Produção',owner='Security Incident Manager',sla=c.severity==='CRITICAL'?'15 minutos':c.severity==='HIGH'?'30 minutos':'4 horas',priority=c.severity==='CRITICAL'?'P1 — Urgente':c.severity==='HIGH'?'P2 — Alta':'P3 — Moderada',impact='ALTO';
 if(title.includes('dba')||title.includes('impersonate')||title.includes('privilégio')){category='Privilege Escalation';department='IAM + Cyber Security';queue='IAM — Identity & Access';support=isOracle?'DBA Oracle — Produção':'DBA SQL Server — Produção';impact='CRÍTICO'}
 else if(title.includes('extração')||title.includes('sensível')){category='Possible Data Exfiltration';department='Cyber Incident Response';queue='Cyber Incident Response';support='Data Protection / Privacy';impact='CRÍTICO'}
 else if(title.includes('auditoria')){category='Security Control Tampering';department='Cyber Security / GRC';queue='SOC N2 — Database Security';support=isOracle?'DBA Oracle — Produção':'DBA SQL Server — Produção';impact='ALTO'}
 else if(title.includes('backup')){category='Unauthorized Data Movement';department='Cyber Incident Response';queue='Cyber Incident Response';support='Infrastructure & Backup Team';impact='ALTO'}
 else if(title.includes('database link')){category='Unapproved External Connectivity';department='Database Security Architecture';queue='DBA Oracle — Produção';support='Network Security';impact='ALTO'}
 else if(title.includes('autenticação')){category='Authentication Attack';department='SOC + IAM';queue='SOC N2 — Database Security';support='IAM — Identity & Access';impact='MÉDIO'}
 else if(title.includes('objeto crítico')||sql.includes('drop')){category='Destructive Database Activity';department='Cyber Incident Response + Database Operations';queue=isOracle?'DBA Oracle — Produção':'DBA SQL Server — Produção';support='Cyber Incident Response';impact='CRÍTICO'}
 return {category,department,queue,support,owner,sla,priority,impact};
}
function openIncidentDetail(){
 if(currentCaseIndex===null){toast('Selecione ou simule um incidente primeiro.','danger');return}
 const c=investigationCases[currentCaseIndex],r=incidentRoutingProfile(c);
 $('#detailIncidentTitle').textContent=c.title;$('#detailIncidentSubtitle').textContent=c.description;
 $('#detailIncidentSeverity').textContent=c.severity;$('#detailIncidentSeverity').className='severity '+c.severity;
 $('#detailIncidentId').textContent=c.id;$('#detailIncidentStatus').textContent=c.status;$('#detailIncidentRisk').textContent=c.risk+'/100';$('#detailIncidentSla').textContent=r.sla;$('#detailIncidentPriority').textContent=r.priority;
 $('#detailExecutiveSummary').textContent=`O Imperva identificou ${c.title.toLowerCase()} no ativo ${c.db}. A atividade foi executada pelo usuário ${c.user}, a partir de ${c.ip}, utilizando ${c.program}. O evento atingiu Risk Score ${c.risk}/100 e requer análise da equipe ${r.department}.`;
 $('#detailCoreFacts').innerHTML=[['Database',c.db],['Host',c.host],['Database User',c.user],['Client IP',c.ip],['Programa',c.program],['Linhas / Eventos',c.rows],['Status',c.status],['Risk Score',c.risk+'/100']].map(x=>`<span>${x[0]}<b>${x[1]}</b></span>`).join('');
 $('#detailCategory').textContent=r.category;$('#detailBusinessImpact').textContent=r.impact;$('#detailSensitiveData').textContent=c.sensitive;$('#detailEnvironment').textContent='PRODUÇÃO';
 $('#detailImpactDescription').textContent=c.risk>=90?'O incidente pode resultar em comprometimento de dados, elevação indevida de privilégio, indisponibilidade ou perda de evidências. A resposta deve começar imediatamente.':'O evento apresenta risco relevante e precisa ser confirmado com o responsável pelo ativo antes do encerramento.';
 $('#detailEvidenceGrid').innerHTML=[['Policy Match','TRUE'],['Origem',c.ip],['Usuário',c.user],['Objeto principal',c.objects?.[0]?.[0]||c.db],['Dados sensíveis',c.sensitive],['Registros',c.rows],['Aplicação',c.program],['Detecção','Imperva DAM']].map(x=>`<span>${x[0]}<b>${x[1]}</b></span>`).join('');
 $('#detailCommandPreview').textContent=c.sql;
 const flow=[['Imperva DAM','Detecção'],['SOC N1','Triagem'],[r.queue,'Responsável'],[r.support,'Apoio'],['Incident Manager','Decisão']];
 $('#detailEscalationFlow').innerHTML=flow.map((x,i)=>`${i?'<span class="escalation-arrow">→</span>':''}<div class="escalation-step"><b>${x[0]}</b><small>${x[1]}</small></div>`).join('');
 $('#detailQueue').textContent=r.queue;$('#detailDepartment').textContent=r.department;$('#detailSupportTeam').textContent=r.support;$('#detailOwner').textContent=r.owner;$('#detailResponseTime').textContent=r.sla;
 $('#detailRecommendation').textContent=c.ai || 'Validar o evento, preservar evidências, confirmar o contexto operacional e aplicar contenção quando necessário.';
 $('#detailQueueSelect').value=[...$('#detailQueueSelect').options].some(o=>o.value===r.queue)?r.queue:'SOC N2 — Database Security';
 $('#detailAnalystNote').value='';$('#incidentRoutingLog').classList.add('hidden');
 $('#incidentDetailModal').classList.remove('hidden');document.body.style.overflow='hidden';
}
function closeIncidentDetail(){$('#incidentDetailModal').classList.add('hidden');document.body.style.overflow=''}
function assignCurrentIncident(){
 const c=investigationCases[currentCaseIndex],queue=$('#detailQueueSelect').value,note=$('#detailAnalystNote').value.trim();
 c.status='ASSIGNED';c.assignedQueue=queue;renderIncidentList();updateInvestigationKpis();$('#detailIncidentStatus').textContent='ASSIGNED';$('#detailQueue').textContent=queue;
 const log=$('#incidentRoutingLog');log.classList.remove('hidden');log.innerHTML=`✓ ${c.id} encaminhado para <b>${queue}</b>.<br>${note?`Nota: ${note}`:'Encaminhamento registrado sem observação adicional.'}`;toast('Incidente encaminhado para a fila responsável.');
}
function createIncidentTicket(){
 const c=investigationCases[currentCaseIndex],ticket='INC'+String(1500+currentCaseIndex+investigationCases.length).padStart(7,'0');
 c.ticket=ticket;const log=$('#incidentRoutingLog');log.classList.remove('hidden');log.innerHTML=`✓ Ticket ITSM <b>${ticket}</b> criado e relacionado ao incidente ${c.id}.`;toast('Ticket ITSM criado com sucesso.');
}
function openIncidentWorkbench(){closeIncidentDetail();openCase(currentCaseIndex);$('#newIncidentBanner').classList.add('hidden');document.querySelector('#investigationCase')?.scrollIntoView({behavior:'smooth',block:'start'});toast('Workbench completo de investigação aberto.');}

// ============================================================
// v1.0.0 Enterprise Edition
// ============================================================
const officialDocs=[
 {id:"guides",cat:"Portal",title:"Imperva Documentation — Guides",desc:"Catálogo oficial de guias e versões dos produtos Imperva.",url:"https://docs.imperva.com/bundle",tag:"Official"},
 {id:"dam-user",cat:"Database Activity Monitoring",title:"Database Activity Monitoring User Guide",desc:"Guia oficial do DAM com conceitos e tarefas operacionais.",url:"https://docs.imperva.com/en-US/bundle/v14.9-database-activity-monitoring-user-guide/page/70414.htm",tag:"DAM"},
 {id:"dam-overview",cat:"Database Activity Monitoring",title:"Database Activity Monitoring Overview",desc:"Visão geral das tarefas de monitoramento e auditoria de atividade em bancos.",url:"https://docs.imperva.com/bundle/v1-data-security-overview-and-integration-guide/page/79746.htm",tag:"Overview"},
 {id:"deployment",cat:"Arquitetura",title:"Deployment Environments",desc:"Ambientes de implantação e comunicação entre componentes do Data Security Fabric.",url:"https://docs.imperva.com/bundle/v1-data-security-overview-and-integration-guide/page/79282.htm",tag:"Architecture"},
 {id:"coverage",cat:"Compatibilidade",title:"Data Security Coverage Tool",desc:"Consulta dinâmica de bancos, produtos e versões suportadas.",url:"https://docs.imperva.com/bundle/articles/page/74910.htm",tag:"Compatibility"},
 {id:"resources",cat:"Compatibilidade",title:"Data Security Additional Resources",desc:"Acesso à cobertura, integrações e recursos complementares de Data Security.",url:"https://docs.imperva.com/bundle/v1-data-security-overview-and-integration-guide/page/78600.htm",tag:"Resources"},
 {id:"releases",cat:"Release Management",title:"Imperva Software Releases",desc:"Versões principais atuais e respectivos release notes.",url:"https://docs.imperva.com/bundle/articles/page/73179.htm",tag:"Releases"},
 {id:"dsf-release",cat:"Release Management",title:"Data Security Fabric Release Notes",desc:"Notas de versão dos produtos que compõem o Data Security Fabric.",url:"https://docs.imperva.com/bundle/v1-data-security-overview-and-integration-guide/page/release-notes.htm",tag:"Release Notes"},
 {id:"dra-dashboard",cat:"Analytics",title:"Data Risk Analytics Dashboard",desc:"Referência do dashboard e dos recursos de Data Risk Analytics.",url:"https://docs.imperva.com/en-US/bundle/v4.8-dra-user-guide/page/59495.htm",tag:"DRA"},
 {id:"dra-policy",cat:"Policies",title:"Configuring Policies for Database Activity Monitor",desc:"Referência oficial para configuração de políticas relacionadas ao DAM.",url:"https://docs.imperva.com/en-US/bundle/v4.2-dra-installation-guide/page/60310.htm",tag:"Policies"},
 {id:"community",cat:"Suporte",title:"Imperva Customer Community",desc:"Discussões técnicas, vídeos, experiências e conteúdo da comunidade de clientes.",url:"https://community.imperva.com/",tag:"Community"},
 {id:"api",cat:"API",title:"Imperva API Documentation",desc:"Referência oficial para automação e integração programática com a plataforma.",url:"https://docs.imperva.com/bundle/cloud-application-security/page/api/api.htm",tag:"API"}
];
let officialFavorites=new Set(JSON.parse(localStorage.getItem("impervaOfficialFavorites")||"[]"));
let showOnlyFavorites=false;
function renderOfficialDocs(filter=""){
 const q=filter.toLowerCase();
 const list=officialDocs.filter(d=>(!showOnlyFavorites||officialFavorites.has(d.id))&&(`${d.title} ${d.cat} ${d.desc} ${d.tag}`.toLowerCase().includes(q)));
 $("#officialDocsGrid").innerHTML=list.length?list.map(d=>`<article class="official-doc-card"><header><span>${d.cat}</span><button class="doc-favorite ${officialFavorites.has(d.id)?'active':''}" data-favorite="${d.id}" title="Favoritar">${officialFavorites.has(d.id)?'★':'☆'}</button></header><h3>${d.title}</h3><p>${d.desc}</p><footer><em>${d.tag}</em><a href="${d.url}" target="_blank" rel="noopener noreferrer" data-official-open="${d.id}">Abrir documentação oficial ↗</a></footer></article>`).join(""):'<div class="console-empty official-empty"><p>Nenhuma documentação encontrada.</p></div>';
 renderFavoritePanel();
}
function renderFavoritePanel(){const fav=officialDocs.filter(d=>officialFavorites.has(d.id));$("#docFavorites").innerHTML=fav.length?fav.map(d=>`<button data-open-official="${d.id}"><span>★</span>${d.title}</button>`).join(""):'<p>Nenhum favorito salvo.</p>'}
function saveFavorite(id){officialFavorites.has(id)?officialFavorites.delete(id):officialFavorites.add(id);localStorage.setItem("impervaOfficialFavorites",JSON.stringify([...officialFavorites]));renderOfficialDocs($("#officialDocSearch").value);toast(officialFavorites.has(id)?"Documentação adicionada aos favoritos.":"Documentação removida dos favoritos.")}
function addRecentActivity(label,view="documentation"){
 let recent=JSON.parse(localStorage.getItem("impervaRecentActivity")||"[]");recent=recent.filter(x=>x.label!==label);recent.unshift({label,view,time:new Date().toLocaleString("pt-BR")});recent=recent.slice(0,6);localStorage.setItem("impervaRecentActivity",JSON.stringify(recent));renderRecentActivity();
}
function renderRecentActivity(){const recent=JSON.parse(localStorage.getItem("impervaRecentActivity")||"[]");$("#recentActivity").innerHTML=recent.length?recent.map(x=>`<button data-recent-view="${x.view}"><span>◷</span><div>${x.label}<small>${x.time}</small></div></button>`).join(""):'<p>Nenhuma atividade registrada.</p>'}
const documentationGuides=[
 {cat:"Instalação",title:"Planejamento e pré-requisitos",level:"Foundation",summary:"Prepare infraestrutura, rede, acessos e critérios de aceite antes da implantação.",objective:"Construir um plano de implantação rastreável e seguro.",when:"Antes de instalar Management Server, Gateway ou métodos de monitoramento.",prereqs:["Versão e licenciamento definidos","Inventário Oracle e SQL Server","DNS, NTP e rotas validados","Responsáveis técnicos identificados"],expected:"Plano aprovado, dependências registradas e critérios de sucesso definidos.",flow:["Sizing","Network","Access","Install","Validation"],steps:[["Inventariar componentes","Liste ambientes, bancos, versões, hosts e criticidade.","inventory: ORCLPRD, SQLPROD01"],["Definir arquitetura","Posicione Management, Gateway, agentes e integrações.","design: management -> gateway -> data sources"],["Validar rede","Confirme resolução de nomes, sincronismo de horário e comunicação necessária.","check: dns, ntp, routing, firewall"],["Definir aceite","Estabeleça testes de heartbeat, coleta, política e SIEM.","acceptance: health + events + alert + integration"]],validation:["Architecture","APPROVED","Network","READY","Owners","ASSIGNED","Acceptance","DEFINED"],trouble:[["DNS inconsistente","Hostnames não resolvem entre componentes","Corrigir DNS e testar resolução bidirecional"],["NTP divergente","Eventos aparecem fora de ordem","Sincronizar todos os componentes"],["Portas bloqueadas","Heartbeat ou registro falha","Validar fluxo com a equipe de rede"]],check:["Inventário revisado","Arquitetura aprovada","Rede validada","Acessos autorizados","Critérios de aceite documentados"]},
 {cat:"Instalação",title:"Management Server — roteiro de implantação",level:"Intermediate",summary:"Fluxo educacional para preparar e validar o componente de gerenciamento.",objective:"Compreender as etapas e controles de uma implantação centralizada.",when:"Na criação do plano de instalação ou apresentação da arquitetura.",prereqs:["Sizing aprovado","Sistema suportado","Certificados e DNS","Conta administrativa segura"],expected:"Componente registrado, acesso administrativo validado e auditoria habilitada.",flow:["OS Ready","Package","Initialize","Secure","Login Test"],steps:[["Preparar host","Aplique hardening, horário e resolução de nomes.","host-check --dns --ntp --storage"],["Instalar pacote oficial","Utilize o pacote e guia correspondentes à versão licenciada.","installer <official-package>"],["Inicializar serviço","Configure identidade, certificados e armazenamento.","initialize management-service"],["Criar administração segura","Defina RBAC, contas nominativas e política de senha.","rbac: admin, operator, auditor"],["Executar aceite","Valide login, saúde, auditoria administrativa e backup.","health-check management"]],validation:["Service","ONLINE","Admin Login","SUCCESS","Audit","ENABLED","Backup","READY"],trouble:[["Serviço não inicia","Dependência ou recurso insuficiente","Revisar logs, memória, disco e compatibilidade"],["Login indisponível","DNS, certificado ou serviço web","Validar endpoint e cadeia de certificado"],["Auditoria vazia","Configuração ou permissão","Executar alteração de teste e revisar trail"]],check:["Host preparado","Pacote compatível confirmado","RBAC configurado","Auditoria validada","Backup inicial executado"]},
 {cat:"Instalação",title:"Gateway e registro de componentes",level:"Intermediate",summary:"Configure a camada de coleta e valide comunicação com o gerenciamento.",objective:"Registrar um Gateway e comprovar o fluxo de eventos.",when:"Após o Management Server estar operacional.",prereqs:["Management online","Gateway provisionado","Certificados disponíveis","Comunicação autorizada"],expected:"Gateway Healthy, filas normais e evento de teste recebido.",flow:["Gateway","Register","Trust","Heartbeat","Event"],steps:[["Preparar Gateway","Valide recursos, DNS, NTP e conectividade.","gateway-precheck"],["Estabelecer confiança","Registre o componente usando mecanismo oficial da versão.","register gateway -> management"],["Validar heartbeat","Confirme saúde e horário do último contato.","health gateway GW-01"],["Executar evento de teste","Gere atividade controlada em fonte de laboratório.","test-event source=ORCLPRD"],["Verificar filas","Confirme que ingestão e processamento permanecem normais.","queue-status GW-01"]],validation:["Gateway","HEALTHY","Trust","VALID","Heartbeat","3 seconds","Queue","3%"],trouble:[["Registro recusado","Token, certificado ou relógio inválido","Refazer confiança e sincronizar NTP"],["Heartbeat ausente","Rede ou serviço indisponível","Testar rota e processo do Gateway"],["Fila crescente","Capacidade abaixo do volume","Revisar sizing e taxa de ingestão"]],check:["Gateway registrado","Trust válido","Heartbeat estável","Evento recebido","Fila dentro do limite"]},
 {cat:"Configuração",title:"Onboarding Oracle Database",level:"Advanced",summary:"Cadastre e valide uma fonte Oracle com monitoramento e políticas iniciais.",objective:"Demonstrar o onboarding lógico de Oracle Database.",when:"Ao incluir novas instâncias Oracle no escopo de DAM.",prereqs:["Versão compatível confirmada","Listener e serviços conhecidos","Conta técnica mínima","Método de monitoramento definido"],expected:"ORCLPRD protegido, eventos normalizados e políticas de privilégio ativas.",flow:["Oracle","Discovery","Monitor","Policy","Alert"],steps:[["Cadastrar ativo","Informe nome lógico, host, serviço, ambiente e owner.","asset add ORCLPRD type=Oracle"],["Selecionar método","Defina agente, rede, auditoria ou combinação suportada.","monitoring method=<approved>"],["Validar descoberta","Confirme instância, schemas e contexto de sessão.","discover ORCLPRD"],["Aplicar políticas","Associe GRANT DBA, SYS e acesso sensível.","attach policies ORCLPRD"],["Executar teste","Gere SELECT permitido e GRANT controlado.","GRANT DBA TO DEMO_USER;"]],validation:["Source","PROTECTED","Sessions","VISIBLE","Policy Match","TRUE","Alert","DELIVERED"],trouble:[["Sessões locais ausentes","Método sem cobertura local","Adicionar método complementar"],["Objeto não resolvido","Metadados incompletos","Atualizar discovery e privilégios mínimos"],["SYS sem contexto","Conexão especial ou limitação do método","Validar matriz e configuração específica"]],check:["Ativo cadastrado","Método aprovado","Sessões visíveis","Políticas associadas","Teste positivo e negativo concluídos"]},
 {cat:"Configuração",title:"Onboarding Microsoft SQL Server",level:"Advanced",summary:"Cadastre SQL Server e monitore logins, server roles e dados sensíveis.",objective:"Demonstrar onboarding e validação de SQL Server.",when:"Ao proteger instâncias SQL Server corporativas.",prereqs:["Versão e topologia confirmadas","Autenticação definida","Always On ou cluster mapeado","Conta técnica mínima"],expected:"SQLPROD01 protegido e alterações de sysadmin detectadas.",flow:["SQL Server","Identity","Monitor","Policy","SIEM"],steps:[["Cadastrar instância","Registre listener, instância, host e owner.","asset add SQLPROD01 type=MSSQL"],["Mapear autenticação","Documente Windows, SQL Login e contas de serviço.","identity-map SQLPROD01"],["Configurar monitoramento","Selecione método compatível e cobertura necessária.","monitoring method=<approved>"],["Associar políticas","Inclua sa, sysadmin, falhas de login e DDL.","attach policies SQLPROD01"],["Executar teste","Simule inclusão controlada em sysadmin.","ALTER SERVER ROLE sysadmin ADD MEMBER demo_login;"]],validation:["Source","PROTECTED","Login Context","VISIBLE","Sysadmin Policy","MATCHED","SIEM","ACK"],trouble:[["Instância nomeada não descoberta","Resolução ou browser service","Validar endpoint e porta explícita"],["Windows user ausente","Contexto de autenticação incompleto","Revisar método e enriquecimento"],["Failover perde coleta","Nó ou listener não coberto","Mapear todos os nós e listener virtual"]],check:["Instância cadastrada","Autenticação mapeada","Failover considerado","Políticas associadas","Teste de sysadmin validado"]},
 {cat:"Operação",title:"Health Check diário",level:"Foundation",summary:"Rotina operacional para verificar saúde, filas, agentes e integrações.",objective:"Executar uma verificação diária consistente.",when:"No início do turno ou antes de mudanças importantes.",prereqs:["Acesso de operador","Dashboard disponível","Lista de componentes","Limites operacionais definidos"],expected:"Todos os componentes classificados e desvios encaminhados.",flow:["Management","Gateway","Agents","Queues","Integrations"],steps:[["Verificar Management","Confirme serviço, acesso e utilização de recursos.","status management"],["Verificar Gateways","Revise heartbeat, filas e erros recentes.","status gateways"],["Verificar fontes","Identifique agentes offline ou fontes sem evento.","status data-sources"],["Validar integrações","Confirme SIEM, e-mail e ITSM.","status integrations"],["Registrar resultado","Documente exceções e responsáveis.","daily-check record"]],validation:["Management","ONLINE","Gateways","HEALTHY","Agents","2/2","Integrations","ONLINE"],trouble:[["Fonte sem eventos","Baixa atividade ou coleta interrompida","Gerar evento controlado e verificar ponta a ponta"],["Fila acima do limite","Pico ou capacidade insuficiente","Acompanhar tendência e escalar capacidade"],["SIEM sem ACK","Destino ou credencial","Testar envio e validar token"]],check:["Management online","Gateways healthy","Agentes com heartbeat","Filas normais","Integrações confirmadas"]},
 {cat:"Operação",title:"Backup, restore e continuidade",level:"Intermediate",summary:"Planeje proteção das configurações, políticas e dados de auditoria.",objective:"Definir um processo verificável de continuidade.",when:"Na implantação e durante revisões periódicas de DR.",prereqs:["RPO e RTO definidos","Destino seguro","Criptografia e retenção","Ambiente de teste"],expected:"Backup íntegro e procedimento de restauração testado.",flow:["Backup","Encrypt","Store","Restore Test","Evidence"],steps:[["Definir escopo","Inclua configurações, políticas, usuários e metadados necessários.","backup scope=configuration,policies,audit"],["Executar backup","Use mecanismo oficial e destino protegido.","backup run"],["Validar integridade","Confirme checksum, tamanho e logs.","backup verify"],["Testar restauração","Restaure em ambiente isolado conforme procedimento.","restore test environment=DR-LAB"],["Registrar evidência","Documente tempo, resultado e pendências.","dr-evidence save"]],validation:["Backup","SUCCESS","Encryption","ENABLED","Integrity","VALID","Restore Test","PASSED"],trouble:[["Backup incompleto","Espaço, permissão ou escopo","Corrigir destino e repetir com validação"],["Restore incompatível","Versão divergente","Usar matriz e ambiente compatível"],["RTO excedido","Processo lento ou manual","Automatizar e revisar arquitetura"]],check:["RPO/RTO aprovados","Backup executado","Integridade confirmada","Restore testado","Evidência arquivada"]},
 {cat:"Operação",title:"Upgrade e gestão de compatibilidade",level:"Advanced",summary:"Planeje atualização controlada de componentes e agentes.",objective:"Reduzir risco de incompatibilidade durante upgrades.",when:"Antes de aplicar nova versão, patch ou agente.",prereqs:["Release notes oficiais","Matriz de compatibilidade","Backup recente","Plano de rollback"],expected:"Upgrade validado sem perda de coleta ou políticas.",flow:["Assess","Backup","Stage","Upgrade","Validate"],steps:[["Revisar compatibilidade","Compare Management, Gateway, agentes e fontes.","compatibility review"],["Definir sequência","Planeje ordem recomendada pela documentação da versão.","upgrade sequence plan"],["Executar backup","Preserve estado anterior e confirme restore.","pre-upgrade backup"],["Atualizar por ondas","Use laboratório, piloto e produção.","wave: lab -> pilot -> prod"],["Validar regressão","Teste health, evento, política, alerta e SIEM.","post-upgrade acceptance"]],validation:["Compatibility","APPROVED","Backup","VALID","Pilot","PASSED","Regression","PASSED"],trouble:[["Agente incompatível","Versões fora da matriz","Interromper onda e alinhar versões"],["Política não dispara","Mudança de campo ou normalização","Comparar eventos e revisar regra"],["Rollback indisponível","Backup ou procedimento incompleto","Não avançar para produção"]],check:["Release notes revisadas","Matriz aprovada","Rollback testado","Piloto concluído","Aceite pós-upgrade aprovado"]},
 {cat:"Integrações",title:"SIEM, e-mail e ITSM",level:"Intermediate",summary:"Encaminhe eventos com segurança e valide confirmação de entrega.",objective:"Configurar integrações operacionais confiáveis.",when:"Ao integrar o DAM ao fluxo do SOC e gestão de incidentes.",prereqs:["Endpoint e credencial","TLS e certificados","Mapeamento de severidade","Owner da integração"],expected:"Evento recebido, correlacionado e rastreável no sistema de destino.",flow:["Event","Transform","TLS","Destination","ACK"],steps:[["Definir campos","Mapeie ativo, usuário, operação, severidade e incidente.","mapping: source,user,action,severity"],["Configurar transporte","Use canal seguro e credencial dedicada.","transport tls=true"],["Enviar teste","Gere evento com identificador único.","send test EVENT-DEMO-001"],["Validar ACK","Confirme recebimento e correlação no destino.","ack EVENT-DEMO-001"],["Testar falha","Simule indisponibilidade e verifique retry/fila.","failure-test integration"]],validation:["Transport","TLS","Test Event","RECEIVED","Correlation","SUCCESS","Retry","WORKING"],trouble:[["401/403","Credencial inválida ou sem escopo","Renovar token e revisar permissão"],["Evento duplicado","Retry sem deduplicação","Usar identificador único"],["Severidade incorreta","Mapeamento divergente","Ajustar transformação de campos"]],check:["TLS validado","Credencial dedicada","Evento de teste recebido","Correlação confirmada","Falha e retry testados"]},
 {cat:"Troubleshooting",title:"Gateway offline ou fila crescente",level:"Advanced",summary:"Diagnóstico em camadas para comunicação e capacidade.",objective:"Restaurar processamento sem perder rastreabilidade.",when:"Quando heartbeat falha ou backlog cresce continuamente.",prereqs:["Acesso aos logs","Métricas de fila","Topologia de rede","Baseline de capacidade"],expected:"Causa identificada, serviço estabilizado e backlog reduzido.",flow:["Source","Network","Service","Queue","Recovery"],steps:[["Confirmar alcance","Teste rota, DNS e horário entre componentes.","network-check GW-01"],["Validar serviço","Revise processo, recursos e erros recentes.","service-status gateway"],["Analisar filas","Compare ingestão, processamento e tendência.","queue metrics --trend"],["Reduzir impacto","Priorize fontes críticas ou aplique plano de capacidade.","capacity response"],["Confirmar recuperação","Acompanhe backlog até nível normal.","recovery acceptance"]],validation:["Heartbeat","RESTORED","Queue Trend","DECREASING","Events","PROCESSING","Data Loss","NONE"],trouble:[["CPU saturada","Volume maior que sizing","Escalar recursos ou distribuir carga"],["Disco cheio","Retenção, logs ou fila","Liberar capacidade com procedimento seguro"],["Rede intermitente","Perda ou latência","Acionar rede com evidências de tempo"]],check:["Rede validada","Serviço revisado","Causa registrada","Fila reduzindo","Eventos confirmados"]},
 {cat:"Troubleshooting",title:"Política não dispara ou gera falso positivo",level:"Advanced",summary:"Valide escopo, evento normalizado, condição, exceção e ação.",objective:"Ajustar políticas com precisão e evidência.",when:"Quando um teste esperado não gera alerta ou o volume de alertas é excessivo.",prereqs:["Evento de teste reproduzível","Acesso ao Policy Studio","Campos normalizados","Baseline conhecido"],expected:"Teste positivo e negativo aprovados.",flow:["Event","Scope","Condition","Exception","Action"],steps:[["Confirmar evento","Verifique se a atividade chegou com todos os campos.","inspect event"],["Revisar escopo","Confirme fonte, grupo, usuário e objeto.","policy scope check"],["Avaliar condição","Compare operadores e valores com o evento.","policy condition trace"],["Revisar exceções","Identifique exclusões amplas ou expiradas.","policy exceptions"],["Executar testes","Rode caso positivo e negativo controlados.","policy test suite"]],validation:["Positive Test","MATCH","Negative Test","NO MATCH","Action","DELIVERED","False Positive","ACCEPTABLE"],trouble:[["Campo vazio","Coleta ou normalização insuficiente","Corrigir contexto antes da regra"],["Exceção ampla","Regra nunca dispara","Restringir e definir expiração"],["Muitos alertas","Critério sem baseline/contexto","Adicionar volume, horário ou identidade"]],check:["Evento completo","Escopo correto","Condição validada","Exceções revisadas","Testes positivo/negativo aprovados"]},
 {cat:"Boas práticas",title:"Hardening, RBAC e privilégio mínimo",level:"Intermediate",summary:"Proteja a própria plataforma e separe administração, operação e auditoria.",objective:"Aplicar governança e reduzir risco administrativo.",when:"Durante implantação e revisões periódicas de acesso.",prereqs:["Matriz de funções","Contas nominativas","Processo de recertificação","Integração de identidade"],expected:"Acessos segregados, auditáveis e revisados.",flow:["Identity","RBAC","MFA","Audit","Review"],steps:[["Definir funções","Separe administrador, operador, analista e auditor.","roles: admin,operator,analyst,auditor"],["Criar contas nominativas","Evite compartilhamento e contas genéricas.","identity individual=true"],["Aplicar autenticação forte","Integre MFA/SSO quando suportado.","authentication strong"],["Auditar administração","Registre login e alterações de configuração.","admin-audit enabled"],["Recertificar acesso","Revise periodicamente owner e necessidade.","access-review quarterly"]],validation:["Shared Accounts","0","MFA","ENABLED","Admin Audit","ACTIVE","Access Review","CURRENT"],trouble:[["Privilégio excessivo","Role ampla por conveniência","Criar funções específicas"],["Conta órfã","Owner saiu ou mudou de função","Desabilitar e recertificar"],["Auditoria alterável","Separação de função inadequada","Restringir acesso e proteger retenção"]],check:["Funções segregadas","Contas nominativas","MFA/SSO avaliado","Auditoria administrativa ativa","Recertificação agendada"]}
];
let currentDocIndex=null,currentReportType=0,currentDemoIndex=null,currentDemoStep=0,monitorPaused=false,monitorTimer=null;
const reportTypes=[
 {icon:"◈",name:"Executive Security Report",desc:"Resumo de risco, incidentes e decisões para liderança."},
 {icon:"⌁",name:"Technical Activity Report",desc:"Detalhes de eventos, usuários, SQL e objetos."},
 {icon:"◆",name:"Policy Effectiveness Report",desc:"Disparos, falsos positivos e recomendações."},
 {icon:"▦",name:"Compliance Audit Report",desc:"Trilha de auditoria e evidências de controles."},
 {icon:"⬡",name:"Platform Health Report",desc:"Saúde de componentes, filas e integrações."}
];
const demoScenarios=[
 {icon:"◉",cat:"ORACLE",title:"Privilege Escalation",desc:"SYSTEM concede DBA a uma conta de aplicação.",duration:"3 min",steps:[["Conexão privilegiada","SYSTEM conecta ao ORCLPRD","User","SYSTEM","Status","MONITORED"],["Comando executado","GRANT DBA TO APP_FINANCEIRO","Operation","GRANT DBA","Target","APP_FINANCEIRO"],["Política acionada","Oracle Privilege Escalation","Severity","CRITICAL","Risk Score","96/100"],["Resposta automática","Alerta, incidente e SIEM","Incident","IMP-2026-00482","Action","SOC NOTIFIED"]]},
 {icon:"⇩",cat:"DATA EXFILTRATION",title:"Massive Data Extraction",desc:"APP_BATCH consulta 185 mil registros sensíveis.",duration:"4 min",steps:[["Baseline normal","Conta processa cerca de 10 mil registros","Baseline","10.040 rows","Window","01:00-02:00"],["Desvio detectado","Consulta retorna volume anormal","Rows","185.430","Deviation","+1.747%"],["Dados sensíveis","CPF, cartão e e-mail identificados","Classification","3 categories","Policy","MATCH"],["Investigation","Caso crítico aberto para o SOC","Incident","IMP-2026-00481","Risk","92/100"]]},
 {icon:"▤",cat:"SQL SERVER",title:"SYSADMIN Abuse",desc:"Conta sa inclui login de aplicação em sysadmin.",duration:"3 min",steps:[["Login administrativo","sa conecta ao SQLPROD01","Login","sa","Client","SSMS"],["Role alterada","ADD MEMBER app_financeiro","Role","sysadmin","Target","app_financeiro"],["Policy match","Unauthorized Sysadmin Grant","Severity","CRITICAL","Risk","95/100"],["Remediação","Remover role e aplicar privilégio mínimo","Action","REMOVE MEMBER","Status","RECOMMENDED"]]},
 {icon:"⌕",cat:"SENSITIVE DATA",title:"Unauthorized Sensitive Access",desc:"Conta de relatório acessa CPF e cartões fora do perfil.",duration:"3 min",steps:[["Discovery","Colunas sensíveis já classificadas","CPF","CONFIRMED","CARD_NUMBER","CONFIRMED"],["Consulta","APP_REPORT acessa tabela CLIENTES","User","APP_REPORT","Rows","4.284"],["Behavior analytics","Origem e volume divergem do histórico","Baseline","EXCEEDED","Origin","UNUSUAL"],["Response","Alerta alto e revisão do owner","Severity","HIGH","Workflow","ASSIGNED"]]},
 {icon:"♟",cat:"INSIDER THREAT",title:"Shared Privileged Account",desc:"SYSTEM aparece simultaneamente em duas origens.",duration:"3 min",steps:[["Primeira sessão","SYSTEM conecta da rede administrativa","Origin","10.0.0.10","Session","A102"],["Segunda sessão","Mesma conta surge em outra origem","Origin","192.168.1.90","Session","B204"],["Correlação","Uso simultâneo de conta compartilhada","Policy","Shared Account","Severity","HIGH"],["Playbook","Identificar operadores e encerrar sessão indevida","Identity","UNKNOWN","Action","INVESTIGATE"]]},
 {icon:"✕",cat:"DESTRUCTIVE ACTIVITY",title:"Critical DROP TABLE",desc:"Tabela de auditoria é removida sem mudança aprovada.",duration:"4 min",steps:[["Comando DDL","DROP TABLE AuditoriaClientes","Executor","sa","Object","CRITICAL"],["Governança","Nenhum ticket encontrado","Change","NOT FOUND","Window","UNAUTHORIZED"],["Critical alert","Risco de perda de evidência","Risk","97/100","Incident","IMP-2026-00483"],["Containment","Preservar logs e iniciar recuperação","Backup","VALIDATE","SOC","ESCALATED"]]}
];
const globalSearchItems=[
 {icon:"▦",title:"Módulos de aprendizagem",desc:"20 módulos interativos",view:"modules"},{icon:"◆",title:"Policy Management Center",desc:"Configuração e teste de políticas",view:"policies"},{icon:"⌕",title:"SOC Investigation Center",desc:"Casos, IA, contenção e playbook",view:"investigation"},{icon:"▥",title:"Documentation Center",desc:"Instalação, configuração e operação",view:"documentation"},{icon:"↗",title:"Official Resources",desc:"Documentação e suporte oficiais",view:"official"},{icon:"⇩",title:"Downloads Center",desc:"Acesso autorizado a software",view:"downloads"},{icon:"⚙",title:"Installation Center",desc:"Implantação guiada em 12 etapas",view:"installation"},{icon:"★",title:"Training Center",desc:"Trilhas, labs e catálogo oficial",view:"training"},{icon:"◌",title:"Live Monitoring",desc:"Activity stream em tempo real",view:"monitoring"},{icon:"▧",title:"Reports Center",desc:"Relatórios enterprise",view:"reports"},{icon:"▶",title:"Demo Scenarios",desc:"Cenários guiados de apresentação",view:"demos"},{icon:"◉",title:"Oracle Lab",desc:"Simulação de atividade Oracle",view:"oracle"},{icon:"▤",title:"SQL Server Lab",desc:"Simulação de atividade SQL Server",view:"sqlserver"},{icon:"⚡",title:"Central de eventos",desc:"Eventos normalizados e filtros",view:"events"},{icon:"›_",title:"Terminal educacional",desc:"CLI simulada",view:"terminal"},
 {title:"Connections Center",desc:"Configuração, teste, validação e habilitação do monitoramento Oracle e SQL Server",view:"connections",icon:"⇄"},
 {title:"About Platform",desc:"Objetivo, tecnologias, versões de referência, recursos, créditos e roadmap",view:"about",icon:"ⓘ"},];
function renderDocCategories(filter=""){const groups={};documentationGuides.forEach((d,i)=>{if(!(`${d.title} ${d.cat} ${d.summary}`.toLowerCase().includes(filter.toLowerCase())))return;(groups[d.cat]??=[]).push([d,i])});$("#docCategories").innerHTML=Object.entries(groups).map(([cat,items])=>`<div class="doc-category"><h4>${cat.toUpperCase()}</h4>${items.map(([d,i])=>`<button class="doc-link ${i===currentDocIndex?"active":""}" data-doc="${i}">${d.title}</button>`).join("")}</div>`).join("")}
function openDocument(i){currentDocIndex=i;const d=documentationGuides[i];addRecentActivity("Guia: "+d.title,"documentation");renderDocCategories($("#docSearch").value);$("#docWelcome").classList.add("hidden");$("#docArticle").classList.remove("hidden");$("#docCategory").textContent=d.cat.toUpperCase();$("#docTitle").textContent=d.title;$("#docSummary").textContent=d.summary;$("#docLevel").textContent=d.level;$("#docObjective").textContent=d.objective;$("#docWhen").textContent=d.when;$("#docPrereqs").innerHTML=d.prereqs.map(x=>`<li>${x}</li>`).join("");$("#docExpected").textContent=d.expected;$("#docFlow").innerHTML=d.flow.map((x,j)=>`${j?'<span class="doc-flow-arrow">→</span>':''}<span class="doc-flow-node">${x}</span>`).join("");$("#docProcedure").innerHTML=d.steps.map((x,j)=>`<article class="doc-step"><span class="doc-step-num">${String(j+1).padStart(2,"0")}</span><div><h4>${x[0]}</h4><p>${x[1]}</p><code>${x[2]}</code></div><button class="copy-doc-step" data-copy-doc="${j}">Copiar</button></article>`).join("");$("#docValidationTitle").textContent=`Validar: ${d.title}`;$("#docValidationOutput").innerHTML='<div class="console-empty"><div>⌁</div><h4>Aguardando validação</h4></div>';$("#docTroubleshooting").innerHTML='<div class="trouble-row head"><span>Problema</span><span>Possível causa</span><span>Ação recomendada</span></div>'+d.trouble.map(x=>`<div class="trouble-row"><span>${x[0]}</span><span>${x[1]}</span><span>${x[2]}</span></div>`).join("");$("#docChecklist").innerHTML=d.check.map((x,j)=>`<label class="doc-checklist-item" data-doc-check="${j}"><input type="checkbox">${x}</label>`).join("");$("#docChecklistProgress").textContent=`0/${d.check.length}`;setDocTab("overview")}
function setDocTab(name){$$("#docTabs button").forEach(b=>b.classList.toggle("active",b.dataset.docTab===name));$$('.doc-panel').forEach(p=>p.classList.remove('active'));$("#doc-panel-"+name).classList.add("active")}
function runDocValidation(){const d=documentationGuides[currentDocIndex];$("#docValidationOutput").innerHTML='<div class="console-empty"><div class="pulse-icon">⌁</div><h4>Executando verificações...</h4></div>';setTimeout(()=>{$("#docValidationOutput").innerHTML=`<div class="validation-result-grid">${[0,2,4,6].map(i=>`<span>${d.validation[i]}<b>${d.validation[i+1]}</b></span>`).join("")}</div><div class="validation-log">[START] ${d.title}\n[CHECK] prerequisites ........ PASS\n[CHECK] configuration ........ PASS\n[CHECK] connectivity ......... PASS\n[CHECK] expected result ...... PASS\n[RESULT] VALIDATION SUCCESS</div>`;toast("Validação concluída com sucesso.")},650)}
function renderReportTemplates(){$("#reportTemplates").innerHTML=reportTypes.map((r,i)=>`<button class="report-template ${i===currentReportType?'selected':''}" data-report="${i}"><span>${r.icon}</span><b>${r.name}</b><small>${r.desc}</small></button>`).join("")}
function generateReport(){const r=reportTypes[currentReportType],period=$("#reportPeriod").value,env=$("#reportEnvironment").value;$("#enterpriseReportPreview").innerHTML='<div class="report-placeholder"><div class="pulse-icon">▧</div><h2>Gerando relatório...</h2></div>';setTimeout(()=>{$("#enterpriseReportPreview").innerHTML=`<article class="enterprise-report"><header class="enterprise-report-header"><div><span class="label">IMPER<span>VA</span> DATA SECURITY ACADEMY</span><h1>${r.name}</h1><p>${period} · ${env} · Gerado em ${new Date().toLocaleString('pt-BR')}</p></div><span class="severity CRITICAL">ENTERPRISE DEMO</span></header><div class="enterprise-report-kpis"><div><span>EVENTOS</span><b>12.486</b></div><div><span>CRITICAL</span><b>4</b></div><div><span>POLÍTICAS</span><b>10</b></div><div><span>FONTES</span><b>2</b></div></div><section class="report-section"><h3>Resumo executivo</h3><p>O ambiente demonstrativo mantém Oracle ORCLPRD e SQL Server SQLPROD01 protegidos. Foram identificados quatro eventos críticos relacionados a privilégio, extração massiva e alteração destrutiva. As integrações e componentes permanecem operacionais.</p></section><section class="report-section"><h3>Principais riscos</h3><table class="report-table"><thead><tr><th>Incidente</th><th>Banco</th><th>Risco</th><th>Status</th></tr></thead><tbody><tr><td>Mass Data Extraction</td><td>ORCLPRD</td><td>92</td><td>Investigating</td></tr><tr><td>Grant DBA</td><td>ORCLPRD</td><td>96</td><td>Open</td></tr><tr><td>Critical DROP TABLE</td><td>SQLPROD01</td><td>97</td><td>Open</td></tr></tbody></table></section><section class="report-section"><h3>Recomendações prioritárias</h3><ol><li>Revisar concessões administrativas e aplicar privilégio mínimo.</li><li>Investigar a extração massiva e validar o owner da aplicação.</li><li>Preservar evidências da alteração destrutiva e testar recuperação.</li><li>Manter testes periódicos de políticas e integrações.</li></ol></section></article>`;$("#reportExportActions").classList.remove("hidden");toast("Relatório gerado.")},700)}
function seedLiveStream(){const rows=[["ORCLPRD","APP_WEB","SELECT CLIENTES","Sensitive Data","LOW"],["SQLPROD01","report_user","SELECT VIEW","Routine Activity","LOW"],["ORCLPRD","SYSTEM","ALTER USER","Privileged Activity","MEDIUM"],["SQLPROD01","etl_user","BULK SELECT","Volume Monitoring","HIGH"],["ORCLPRD","APP_BATCH","SELECT CARTOES","Sensitive Data","HIGH"]];$("#liveStream").innerHTML="";rows.forEach(r=>addStreamRow(r,false))}
function addStreamRow(data,isNew=true){const now=new Date().toLocaleTimeString('pt-BR'),db=data[0],sev=data[4];const row=document.createElement('div');row.className='stream-row '+(isNew?'new':'');row.innerHTML=`<time>${now}</time><span class="stream-db ${db==='ORCLPRD'?'oracle':'sql'}">${db}</span><span>${data[1]}</span><span class="stream-operation">${data[2]}</span><span>${data[3]}</span><span class="severity ${sev}">${sev}</span>`;$("#liveStream").prepend(row);while($("#liveStream").children.length>22)$("#liveStream").lastElementChild.remove()}
function startMonitor(){if(monitorTimer)clearInterval(monitorTimer);monitorTimer=setInterval(()=>{if(monitorPaused)return;const samples=[["ORCLPRD","APP_WEB","SELECT CLIENTES","Routine","LOW"],["SQLPROD01","sa","ALTER LOGIN","Privileged","MEDIUM"],["ORCLPRD","REPORT_USER","SELECT CPF","Sensitive Data","HIGH"],["SQLPROD01","APP_API","INSERT PAGAMENTO","DML","LOW"],["ORCLPRD","SYSTEM","GRANT ROLE","Privilege","CRITICAL"]];addStreamRow(samples[Math.floor(Math.random()*samples.length)]);$("#eventsPerMinute").textContent=String(175+Math.floor(Math.random()*25))},1800)}
function renderDemoScenarios(){$("#demoScenariosGrid").innerHTML=demoScenarios.map((d,i)=>`<article class="demo-scenario-card card" data-demo="${i}"><span>${d.icon}</span><span class="label">${d.cat}</span><h3>${d.title}</h3><p>${d.desc}</p><div class="demo-scenario-meta"><b>▶ Iniciar demonstração</b><span>${d.duration}</span></div></article>`).join("")}
function openDemo(i){currentDemoIndex=i;currentDemoStep=0;const d=demoScenarios[i];$("#demoPlayer").classList.remove("hidden");$("#demoPlayerCategory").textContent=d.cat;$("#demoPlayerTitle").textContent=d.title;$("#demoPlayerDescription").textContent=d.desc;renderDemoPlayer();$("#demoPlayer").scrollIntoView({behavior:'smooth'})}
function renderDemoPlayer(){const d=demoScenarios[currentDemoIndex];$("#demoSteps").innerHTML=d.steps.map((s,i)=>`<div class="demo-step-item ${i<currentDemoStep?'done':i===currentDemoStep?'active':''}">${i<currentDemoStep?'✓':String(i+1).padStart(2,'0')} · ${s[0]}</div>`).join("");$("#demoProgressBar").style.width=(currentDemoStep/d.steps.length*100)+'%';if(currentDemoStep===0)$("#demoScreen").innerHTML='<div class="console-empty"><div>▶</div><h3>Demonstração pronta</h3><p>Execute as etapas para contar a história do incidente.</p></div>';$("#nextDemoStep").textContent=currentDemoStep>=d.steps.length?'Demonstração concluída ✓':'Executar próxima etapa →';$("#nextDemoStep").disabled=currentDemoStep>=d.steps.length}
function nextDemo(){const d=demoScenarios[currentDemoIndex];if(currentDemoStep>=d.steps.length)return;const s=d.steps[currentDemoStep];$("#demoScreen").innerHTML=`<div class="demo-screen-banner"><span class="label">ETAPA ${String(currentDemoStep+1).padStart(2,'0')}</span><h3>${s[0]}</h3><p>${s[1]}</p></div><div class="demo-screen-grid"><span>${s[2]}<b>${s[3]}</b></span><span>${s[4]}<b>${s[5]}</b></span></div><div class="demo-screen-log">[CAPTURE] activity received\n[NORMALIZE] context enriched\n[ANALYZE] rules and baseline applied\n[RESULT] ${s[5]}\n[STATUS] STEP COMPLETED</div>`;currentDemoStep++;renderDemoPlayer();if(currentDemoStep===d.steps.length)toast("Cenário concluído com sucesso.")}
function openGlobalSearch(){$("#globalSearchModal").classList.remove("hidden");$("#globalSearchInput").value="";renderGlobalResults("");setTimeout(()=>$("#globalSearchInput").focus(),50)}
function closeGlobalSearch(){$("#globalSearchModal").classList.add("hidden")}
function renderGlobalResults(q){const items=globalSearchItems.filter(x=>(x.title+' '+x.desc).toLowerCase().includes(q.toLowerCase()));$("#globalSearchResults").innerHTML=items.length?items.map(x=>`<div class="global-result" data-search-view="${x.view}"><span>${x.icon}</span><div><b>${x.title}</b><small>${x.desc}</small></div></div>`).join(""):'<div class="console-empty"><p>Nenhum resultado encontrado.</p></div>'}

const termCommands={
help:`Comandos disponíveis:
  imperva status           Status da plataforma demonstrativa
  imperva databases        Fontes de dados protegidas
  imperva events           Últimos eventos capturados
  imperva alerts           Alertas de alta prioridade
  imperva policies         Resumo das políticas ativas
  imperva sensitive-data   Dados sensíveis descobertos
  imperva agents           Saúde dos agentes simulados
  imperva gateways         Estado e capacidade dos Gateways
  imperva health           Health check consolidado
  imperva agent-status     Cobertura e heartbeat dos agentes
  imperva queue            Filas e backlog de processamento
  imperva integrations     Estado de SIEM, SMTP, ITSM e LDAP
  imperva audit-summary    Resumo diário de auditoria
  imperva privileged-users Usuários administrativos ativos
  imperva top-objects      Objetos mais acessados
  imperva failed-logins    Falhas de autenticação recentes
  imperva system-check     Diagnóstico ponta a ponta
  clear                    Limpa o terminal`,
"imperva status":`IMPERvA DATA SECURITY ACADEMY
Platform..............: ONLINE
Gateway...............: HEALTHY
Management............: HEALTHY
Monitoring............: ACTIVE
Data Sources..........: 2
Events Today..........: 12,486
Environment...........: EDUCATIONAL DEMO`,
"imperva databases":`DATABASE      TYPE          STATUS       EVENTS
ORCLPRD       Oracle        Protected    8,421
SQLPROD01     SQL Server    Protected    4,065

2 data sources monitored`,
"imperva events":`TIME       DATABASE     USER          OPERATION              SEVERITY
22:18:44   ORCLPRD      APP_BATCH     SELECT 185K ROWS       CRITICAL
21:52:10   SQLPROD01    sa            ALTER SERVER ROLE      CRITICAL
20:44:07   ORCLPRD      SYSTEM        GRANT DBA              CRITICAL`,
"imperva alerts":`4 CRITICAL ALERTS OPEN
#481 Mass Data Extraction ........ ORCLPRD
#480 Unauthorized Sysadmin Grant . SQLPROD01
#479 Oracle Privilege Escalation . ORCLPRD
#478 Critical Object Change ...... ORCLPRD`,
"imperva policies":`POLICY STATUS
10 Active
0  Disabled
4  Critical severity
4  High severity
2  Medium severity`,
"imperva sensitive-data":`CLASSIFICATION      ORACLE   SQL SERVER   TOTAL
National ID / CPF   12       8            20
Payment Card        7        5            12
Email Address       18       11           29
Financial Data      23       16           39`,
"imperva agents":`HOST          OS         AGENT STATUS   LAST HEARTBEAT
ora-db01      Linux      Healthy        3 seconds ago
sql-db01      Windows    Healthy        5 seconds ago`,
"imperva gateways":`GATEWAY   STATUS    CPU   MEMORY   QUEUE   VERSION
GW-01     ONLINE    34%   48%      12      14.9
GW-02     ONLINE    21%   42%       0      14.9`,
"imperva health":`COMPONENT          STATUS       LATENCY
Management Server  HEALTHY      12 ms
Gateway Cluster    HEALTHY       8 ms
Oracle Agent       HEALTHY       3 ms
SQL Server Agent   HEALTHY       5 ms
SIEM Integration   HEALTHY      18 ms`,
"imperva agent-status":`AGENT        DATABASE     CAPTURE   HEARTBEAT   EVENTS/MIN
ora-agent   ORCLPRD      ACTIVE    3 sec       121
sql-agent   SQLPROD01    ACTIVE    5 sec        64`,
"imperva queue":`QUEUE              PENDING   OLDEST   STATUS
Gateway Events      12        2 sec    NORMAL
SIEM Delivery        0        --       NORMAL
Report Jobs           2        1 min    PROCESSING`,
"imperva integrations":`INTEGRATION   ENDPOINT       STATUS      LAST DELIVERY
SIEM          SOC-SIEM-01    CONNECTED   4 sec ago
SMTP          MAIL-RELAY     CONNECTED   2 min ago
ITSM          SERVICENOW     CONNECTED   8 min ago
LDAP          CORP-AD        CONNECTED   30 sec ago`,
"imperva audit-summary":`AUDIT SUMMARY - LAST 24 HOURS
Activities Captured..... 12,486
Privileged Activities... 184
Policy Violations....... 37
Critical Incidents...... 4
Evidence Retention...... OK`,
"imperva privileged-users":`USER          DATABASE     LAST ACTIVITY   RISK
SYS           ORCLPRD      2 min ago       HIGH
SYSTEM        ORCLPRD      7 min ago       CRITICAL
sa            SQLPROD01    4 min ago       CRITICAL
DBA_SUPORTE   ORCLPRD      18 min ago      MEDIUM`,
"imperva top-objects":`OBJECT                         DATABASE     ACCESSES   RISK
FINANCEIRO.CLIENTES           ORCLPRD      2,941      HIGH
Financeiro.dbo.Clientes       SQLPROD01    1,804      HIGH
FINANCEIRO.CARTOES            ORCLPRD      1,155      CRITICAL
Financeiro.dbo.Pagamentos     SQLPROD01      923      MEDIUM`,
"imperva failed-logins":`TIME       SOURCE          USER       DATABASE     ATTEMPTS
10:31:02   172.16.5.91     unknown    SQLPROD01    12
10:28:18   172.16.10.44    APP_WEB    ORCLPRD      15
09:54:44   10.20.4.18      REPORT     ORCLPRD       4`,
"imperva system-check":`SYSTEM CHECK
[PASS] Management connectivity
[PASS] Gateway heartbeat
[PASS] Agent coverage
[PASS] Policy engine
[PASS] SIEM delivery
[WARN] Certificate expires in 32 days
RESULT: HEALTHY WITH 1 WARNING`
};
const termExplanations={
"imperva status":["Status geral da plataforma","Confirma se Management, Gateway e monitoramento estão ativos. É o primeiro comando de uma checagem operacional."],
"imperva databases":["Inventário protegido","Lista as fontes de dados monitoradas e permite confirmar se Oracle e SQL Server estão protegidos."],
"imperva events":["Eventos recentes","Mostra atividades importantes capturadas. Use para verificar rapidamente o que aconteceu no ambiente."],
"imperva alerts":["Alertas prioritários","Exibe incidentes críticos abertos que exigem análise do SOC ou do administrador."],
"imperva policies":["Resumo de políticas","Apresenta quantas políticas estão ativas e a distribuição por severidade."],
"imperva sensitive-data":["Dados sensíveis descobertos","Resume classificações como CPF, cartões, e-mail e dados financeiros."],
"imperva agents":["Saúde dos agentes","Valida heartbeat e comunicação dos agentes instalados próximos aos bancos."],
"imperva gateways":["Capacidade dos Gateways","Mostra disponibilidade, CPU, memória e filas. Filas crescentes podem indicar necessidade de tuning ou sizing."],
"imperva health":["Health check consolidado","Reúne o estado de todos os componentes e integrações em uma única verificação."],
"imperva agent-status":["Cobertura de captura","Confirma se cada agente está capturando atividade e qual volume processa por minuto."],
"imperva queue":["Filas de processamento","Ajuda a identificar backlog no Gateway, SIEM ou jobs de relatórios."],
"imperva integrations":["Integrações corporativas","Valida SIEM, SMTP, ITSM e LDAP, incluindo a última entrega realizada."],
"imperva audit-summary":["Resumo diário de auditoria","Apresenta volume capturado, atividades privilegiadas, violações e retenção de evidências."],
"imperva privileged-users":["Usuários privilegiados","Lista contas administrativas, última atividade e risco para revisão diária."],
"imperva top-objects":["Objetos mais acessados","Mostra tabelas e objetos com maior volume ou risco, útil para priorizar políticas."],
"imperva failed-logins":["Falhas de autenticação","Identifica origens e contas com tentativas repetidas, ajudando a diferenciar erro operacional de ataque."],
"imperva system-check":["Diagnóstico ponta a ponta","Executa uma validação simulada dos componentes e destaca avisos que precisam de ação administrativa."]};
function terminalInit(){const out=$("#terminalOutput");out.innerHTML=`<span class="success">Imperva Data Security Academy — Educational CLI</span>
Digite <span class="prompt">help</span> para visualizar os comandos.
Aviso: esta interface é uma simulação educacional e não uma CLI oficial.

`}
function execTerminal(cmd){
  cmd=cmd.trim();
  if(!cmd)return;
  if(cmd==="clear"){
    terminalInit();
    if($("#terminalExplanation"))$("#terminalExplanation").innerHTML='<span class="label">COMMAND EXPLANATION</span><h3>Terminal limpo</h3><p>Execute outro comando para visualizar sua explicação operacional.</p>';
    return;
  }
  const out=$("#terminalOutput");
  out.innerHTML+=`<span class="prompt">academy@imperva:~$</span> ${cmd}\n`;
  out.innerHTML+=(termCommands[cmd]||`Comando não reconhecido: ${cmd}\nDigite help para consultar a lista.`)+"\n\n";
  out.scrollTop=out.scrollHeight;
  const exp=termExplanations[cmd];
  if($("#terminalExplanation")){
    $("#terminalExplanation").innerHTML=exp
      ? `<span class="label">COMMAND EXPLANATION</span><h3>${exp[0]}</h3><p>${exp[1]}</p><div class="terminal-admin-tip"><b>Ação do administrador</b><span>${cmd==='imperva system-check'?'Trate primeiro avisos de certificado, comunicação ou filas.':'Compare o resultado com o baseline do ambiente e investigue qualquer estado diferente de HEALTHY, ONLINE ou NORMAL.'}</span></div>`
      : `<span class="label">COMMAND EXPLANATION</span><h3>Comando não reconhecido</h3><p>Utilize <code>help</code> ou um dos botões disponíveis.</p>`;
  }
}

// ============================================================
// v2.0.0 Enterprise Centers
// ============================================================
const architectureComponents={
 users:{title:"Users & DBAs",summary:"Pessoas e identidades que acessam dados diretamente ou por aplicações.",facts:[["Função","Origem da atividade"],["Comunicação","SQL clients / applications"],["Portas","Dependem do banco e rede"],["Requisito","Identidade rastreável"],["Oracle","SYS, SYSTEM, schemas e proxy users"],["SQL Server","Windows logins, SQL logins e roles"]],best:["Preferir contas nominativas.","Integrar com cofre de senhas e MFA quando aplicável.","Evitar usuários compartilhados.","Associar owner e finalidade às contas."],url:"https://docs.imperva.com/bundle/v1-data-security-overview-and-integration-guide/page/78572.htm"},
 apps:{title:"Applications",summary:"Aplicações corporativas geram sessões e comandos que precisam ser correlacionados ao contexto de negócio.",facts:[["Função","Consumir e alterar dados"],["Protocolos","JDBC, ODBC, TDS e drivers nativos"],["Portas","1521/TCPS para Oracle; 1433/TDS como exemplos"],["Requisito","Connection metadata"],["Oracle","Service name, module e client identifier"],["SQL Server","Application name, host e login"]],best:["Definir contas por aplicação.","Enviar contexto da aplicação na conexão.","Separar batch, API e relatórios.","Criar baseline por workload."],url:"https://docs.imperva.com/bundle/v1-data-security-overview-and-integration-guide/page/78595.htm"},
 oracle:{title:"Oracle Database",summary:"Fonte Oracle protegida por método compatível de coleta e políticas de segurança.",facts:[["Função","Armazenar dados críticos"],["Protocolos","Oracle Net / TCPS"],["Portas","1521 é comum; confirme no listener"],["Requisito","Versão coberta e serviço acessível"],["Integração","Sessões, DDL, DML, DCL e contexto"],["HA","RAC, Data Guard e serviços devem ser mapeados"]],best:["Validar cobertura de conexões locais e remotas.","Monitorar SYS e SYSTEM.","Mapear RAC e serviços virtuais.","Testar políticas positivas e negativas."],url:"https://www.imperva.com/data-security-coverage-tool/"},
 sqlserver:{title:"Microsoft SQL Server",summary:"Fonte SQL Server com monitoramento de logins, T-SQL, server roles e dados sensíveis.",facts:[["Função","Armazenar dados relacionais"],["Protocolos","TDS / TLS"],["Portas","1433 é comum; instâncias podem variar"],["Requisito","Topologia e autenticação mapeadas"],["Integração","sa, sysadmin, Windows Auth e application name"],["HA","Always On, listener e nós devem ser considerados"]],best:["Evitar uso direto de sa.","Monitorar mudanças de sysadmin.","Mapear autenticação Windows.","Validar failover e listener virtual."],url:"https://www.imperva.com/data-security-coverage-tool/"},
 agent:{title:"Agent / Collection",summary:"Camada de coleta que observa atividades e adiciona contexto antes do envio.",facts:[["Função","Capturar atividade"],["Comunicação","Canal seguro com Gateway"],["Portas","Variam por versão e deployment"],["Requisito","Compatibilidade e privilégios mínimos"],["Oracle","Cobertura de tráfego local e remoto"],["SQL Server","Contexto de login, host e aplicação"]],best:["Confirmar matriz de compatibilidade.","Acompanhar heartbeat e fila.","Proteger certificados e chaves.","Planejar upgrade coordenado."],url:"https://www.imperva.com/data-security-coverage-tool/"},
 gateway:{title:"Gateway",summary:"Recebe eventos, normaliza metadados e encaminha atividades para análise e gerenciamento.",facts:[["Função","Coleta e normalização"],["Comunicação","Agentes, management e integrações"],["Portas","Consultar inter-component communication"],["Requisito","Sizing, DNS, NTP e certificados"],["HA","Dimensionar redundância e filas"],["Operação","Monitorar CPU, memória, disco e backlog"]],best:["Dimensionar por volume e picos.","Garantir sincronismo de horário.","Monitorar filas continuamente.","Separar redes de gestão quando possível."],url:"https://docs.imperva.com/bundle/v1-data-security-overview-and-integration-guide/page/78595.htm"},
 management:{title:"Management Server",summary:"Centraliza administração, políticas, auditoria, usuários, relatórios e visão operacional.",facts:[["Função","Governança central"],["Comunicação","HTTPS e canais internos"],["Portas","443 é comum para console; confirme a versão"],["Requisito","RBAC, backup e certificados"],["HA","Definir recuperação e continuidade"],["Auditoria","Registrar alterações administrativas"]],best:["Criar perfis separados de admin, operator e auditor.","Executar backups testados.","Usar certificados confiáveis.","Auditar mudanças de política."],url:"https://docs.imperva.com/bundle/v1-data-security-overview-and-integration-guide/page/79741.htm"},
 analytics:{title:"Policies & Risk Analytics",summary:"Aplica condições, classificação, baseline e contexto para calcular severidade e resposta.",facts:[["Função","Detectar risco"],["Entradas","Atividade, identidade, dados e baseline"],["Saídas","Alertas, incidentes e relatórios"],["Requisito","Políticas testadas"],["Oracle","GRANT DBA, SYS e extração"],["SQL Server","sysadmin, sa e falhas de login"]],best:["Reduzir falsos positivos.","Versionar políticas.","Definir owner e SLA.","Revisar exceções com expiração."],url:"https://docs.imperva.com/en-US/bundle/v14.9-database-activity-monitoring-user-guide/page/70414.htm"},
 alerts:{title:"Alerts",summary:"Notificações priorizadas geradas por violações e correlações de risco.",facts:[["Função","Acionar resposta"],["Destinos","SOC, e-mail, SIEM e workflow"],["Severidade","Low a Critical"],["Requisito","SLA e responsável"],["Validação","Teste de entrega"],["Métrica","Tempo até reconhecimento"]],best:["Evitar alert fatigue.","Definir roteamento por severidade.","Testar canais alternativos.","Registrar reconhecimento e decisão."],url:"https://docs.imperva.com/bundle/v1-data-security-overview-and-integration-guide/page/78572.htm"},
 reports:{title:"Reports",summary:"Consolida atividades, violações, postura e evidências para operação e compliance.",facts:[["Função","Evidência e governança"],["Formatos","Executivo, técnico e compliance"],["Retenção","Conforme política organizacional"],["Requisito","Escopo e integridade"],["Oracle","Privileged activity e objetos"],["SQL Server","Logins, roles e T-SQL"]],best:["Definir público e finalidade.","Restringir acesso aos relatórios.","Validar período e timezone.","Preservar integridade das evidências."],url:"https://docs.imperva.com/bundle"},
 siem:{title:"SIEM / ITSM",summary:"Integra eventos e incidentes ao ecossistema corporativo de segurança e atendimento.",facts:[["Função","Correlação e workflow"],["Protocolos","API, syslog ou conectores suportados"],["Portas","Dependem do destino"],["Requisito","Autenticação e mapeamento de campos"],["SIEM","Severidade, usuário, ativo e política"],["ITSM","Ticket, owner, SLA e status"]],best:["Usar transporte seguro.","Mapear deduplicação.","Monitorar falhas de entrega.","Testar caso de uso ponta a ponta."],url:"https://docs.imperva.com/bundle/v1-data-security-overview-and-integration-guide/page/78595.htm"}
};
let selectedArch="gateway";
function renderArchitectureDetail(key){const d=architectureComponents[key];if(!d)return;selectedArch=key;$$('[data-arch]').forEach(x=>x.classList.toggle('selected',x.dataset.arch===key));$('#archDetailTitle').textContent=d.title;$('#archDetailSummary').textContent=d.summary;$('#archDetailGrid').innerHTML=d.facts.map(x=>`<span>${x[0]}<b>${x[1]}</b></span>`).join('');$('#archBestPractices').innerHTML=d.best.map(x=>`<li>${x}</li>`).join('');$('#archOfficialLink').href=d.url}
function simulateArchitectureFlow(){const lines=['[START] User APP_BATCH opens database session','[SOURCE] Oracle ORCLPRD receives SELECT on FINANCEIRO.CLIENTES','[COLLECT] Agent captures user, origin, object and operation','[GATEWAY] Activity normalized and queued','[MANAGEMENT] Policy Mass Data Extraction matched','[ANALYTICS] Risk score calculated: 92/100','[ALERT] Critical incident IMP-2026-00481 created','[SIEM] Event acknowledged by SOC integration','[DONE] End-to-end flow completed'];const out=$('#archFlowConsole');out.textContent='';let i=0;const timer=setInterval(()=>{out.textContent+=lines[i++]+'\n';out.scrollTop=out.scrollHeight;if(i===lines.length)clearInterval(timer)},260)}

const v2OfficialResources=[
 {cat:'Documentação',title:'Thales Cybersecurity Docs Hub',desc:'Portal central de guias, integrações e boas práticas, acessível pelo domínio docs.imperva.com.',url:'https://docs.imperva.com/'},
 {cat:'Documentação',title:'Database Activity Monitoring User Guide',desc:'Guia oficial de operação e recursos do Database Activity Monitoring.',url:'https://docs.imperva.com/en-US/bundle/v14.9-database-activity-monitoring-user-guide/page/70414.htm'},
 {cat:'Documentação',title:'Data Security Fabric Overview',desc:'Visão geral, arquitetura e integração dos componentes de Data Security Fabric.',url:'https://docs.imperva.com/bundle/v1-data-security-overview-and-integration-guide/page/78571.htm'},
 {cat:'Documentação',title:'DSF Architecture',desc:'Visão arquitetural oficial dos componentes e fluxos do Data Security Fabric.',url:'https://docs.imperva.com/bundle/v1-data-security-overview-and-integration-guide/page/78572.htm'},
 {cat:'Documentação',title:'Provisioning and Installing Machines',desc:'Referência oficial para provisionamento e instalação no contexto do DSF.',url:'https://docs.imperva.com/bundle/v1-data-security-overview-and-integration-guide/page/79739.htm'},
 {cat:'Documentação',title:'Setting up Data Security Fabric',desc:'Sequência oficial de tarefas para colocar o Data Security Fabric em operação.',url:'https://docs.imperva.com/bundle/v1-data-security-overview-and-integration-guide/page/79737.htm'},
 {cat:'Produto',title:'Imperva Data Security',desc:'Página oficial do portfólio de segurança de dados.',url:'https://www.imperva.com/products/data-security/'},
 {cat:'Produto',title:'Data Security Fabric',desc:'Visão oficial do produto Data Security Fabric para ambientes híbridos e multicloud.',url:'https://www.imperva.com/products/data-security-fabric/'},
 {cat:'Suporte',title:'Technical Support',desc:'Informações de suporte técnico e acesso ao portal autorizado.',url:'https://www.imperva.com/support/technical-support/'},
 {cat:'Treinamento',title:'Imperva University / Thales Academy',desc:'Página oficial com orientação para a Thales Cybersecurity Academy.',url:'https://www.imperva.com/support/imperva-university/'},
 {cat:'Treinamento',title:'Training Catalog',desc:'Catálogo oficial de treinamentos técnicos publicado pela Imperva/Thales.',url:'https://www.imperva.com/support/wp-content/uploads/sites/26/2025/08/Training-Catalog-2025-0829.pdf'},
 {cat:'Ferramentas',title:'Data Security Coverage Tool',desc:'Ferramenta oficial para consultar cobertura de bancos, versões e requisitos.',url:'https://www.imperva.com/data-security-coverage-tool/'}
];
function renderV2Official(){const q=($('#v2OfficialSearch')?.value||'').toLowerCase(),cat=$('#v2OfficialCategory')?.value||'all';$('#v2OfficialGrid').innerHTML=v2OfficialResources.filter(x=>(cat==='all'||x.cat===cat)&&`${x.title} ${x.desc}`.toLowerCase().includes(q)).map(x=>`<article class="official-resource card"><div class="resource-top"><span class="resource-category">${x.cat.toUpperCase()}</span><span class="verified">✓ OFFICIAL</span></div><h3>${x.title}</h3><p>${x.desc}</p><a href="${x.url}" target="_blank" rel="noopener">Abrir recurso oficial ↗</a></article>`).join('')}

const downloadPackages=[
 {icon:'⬡',title:'Management / Gateway Appliances',desc:'Imagens ou pacotes de infraestrutura para componentes centrais.',items:['Contrato e entitlement','Versão compatível','Sizing aprovado','Checksum validado']},
 {icon:'◉',title:'Oracle Monitoring Components',desc:'Agentes ou componentes compatíveis com o ambiente Oracle.',items:['Oracle version','OS and architecture','RAC/Data Guard topology','Collection method']},
 {icon:'▤',title:'SQL Server Monitoring Components',desc:'Componentes para SQL Server, Windows e topologias de alta disponibilidade.',items:['SQL Server version','Windows version','Always On / cluster','Authentication method']},
 {icon:'↻',title:'Patches and Upgrades',desc:'Atualizações, hotfixes e releases obtidos por canais de suporte.',items:['Release notes','Compatibility matrix','Backup and rollback','Change approval']}
];
function renderDownloadPackages(){$('#downloadPackageGrid').innerHTML=downloadPackages.map(x=>`<article class="download-package card"><div class="pkg-icon">${x.icon}</div><h3>${x.title}</h3><p>${x.desc}</p><ul>${x.items.map(i=>`<li>${i}</li>`).join('')}</ul></article>`).join('')}

const installationStages=[
 {title:'Planning',summary:'Defina escopo, riscos, owners, ambientes e resultados esperados.',objective:'Criar um plano de implantação aprovado e mensurável.',prereqs:['Inventário de bancos','Owners técnicos e de negócio','Requisitos de segurança','Acesso aos guias oficiais'],practices:['Separar DEV, HML e PROD','Registrar premissas e limitações','Definir rollback e aceite','Planejar capacidade e retenção'],expected:'Plano, responsáveis, escopo e critérios de sucesso documentados.',flow:['Business Scope','Data Sources','Risk','Design','Approval'],check:['Escopo aprovado','Owners definidos','Riscos registrados','Critérios de aceite definidos'],issues:[['Escopo indefinido','Ausência de inventário','Executar discovery e workshops'],['Owner ausente','Governança incompleta','Atribuir responsáveis antes do onboarding']],log:['scope=APPROVED','owners=ASSIGNED','risk_register=READY','acceptance=DEFINED'],url:'https://docs.imperva.com/bundle/v1-data-security-overview-and-integration-guide/page/79737.htm'},
 {title:'Prerequisites',summary:'Valide infraestrutura, rede, DNS, NTP, certificados e compatibilidade.',objective:'Evitar bloqueios técnicos antes da instalação.',prereqs:['Sizing preliminar','Acesso de rede','DNS direto e reverso','Sincronismo de horário'],practices:['Usar NTP corporativo','Reservar endereços e nomes','Validar certificados','Consultar Coverage Tool'],expected:'Checklist técnico aprovado para provisionamento.',flow:['Compute','Storage','Network','DNS/NTP','Certificates'],check:['CPU e memória aprovadas','Storage dimensionado','DNS validado','NTP sincronizado','Certificados planejados'],issues:[['Clock skew','NTP divergente','Corrigir sincronismo antes do registro'],['Sem conectividade','Firewall ou rota','Executar matriz de comunicação']],log:['compute=PASS','storage=PASS','dns=PASS','ntp=PASS','network=PASS'],url:'https://docs.imperva.com/bundle/v1-data-security-overview-and-integration-guide/page/79282.htm'},
 {title:'Architecture',summary:'Selecione deployment, componentes, zonas e alta disponibilidade.',objective:'Produzir arquitetura lógica e física consistente.',prereqs:['Escopo','Volume estimado','Requisitos de HA/DR','Segmentação de rede'],practices:['Separar management e data plane','Dimensionar picos','Evitar ponto único de falha','Documentar fluxos'],expected:'Diagrama aprovado com componentes e comunicação.',flow:['Sources','Agents','Gateway','Management','SIEM'],check:['Componentes definidos','Fluxos desenhados','HA avaliada','Integrações mapeadas'],issues:[['Gateway subdimensionado','Volume subestimado','Recalcular eventos e picos'],['Fluxo incompleto','Dependência não mapeada','Revisar inter-component communication']],log:['design=APPROVED','ha=ASSESSED','flows=MAPPED','capacity=VALIDATED'],url:'https://docs.imperva.com/bundle/v1-data-security-overview-and-integration-guide/page/78572.htm'},
 {title:'Management Server',summary:'Provisione, inicialize e proteja o plano de gerenciamento.',objective:'Disponibilizar console, RBAC, auditoria e administração central.',prereqs:['Host ou appliance autorizado','Certificados','DNS/NTP','Conta administrativa inicial'],practices:['Contas nominativas','RBAC mínimo','Backup inicial','Auditoria administrativa'],expected:'Management online, seguro e auditável.',flow:['Provision','Initialize','Certificate','RBAC','Backup'],check:['Serviço online','HTTPS validado','RBAC configurado','Auditoria ativa','Backup executado'],issues:[['Console indisponível','Serviço ou certificado','Revisar saúde e TLS'],['Permissão excessiva','RBAC inadequado','Separar admin, operator e auditor']],log:['management=ONLINE','tls=VALID','rbac=ENABLED','audit=ENABLED','backup=READY'],url:'https://docs.imperva.com/bundle/v1-data-security-overview-and-integration-guide/page/79739.htm'},
 {title:'Gateway',summary:'Implante o componente de coleta, normalização e processamento.',objective:'Receber e processar atividades com capacidade e segurança.',prereqs:['Management disponível','Sizing aprovado','Comunicação liberada','Certificados válidos'],practices:['Monitorar fila','Validar heartbeat','Testar failover','Proteger chaves'],expected:'Gateway registrado, healthy e processando eventos.',flow:['Provision','Register','Secure Channel','Health','Event Test'],check:['Gateway registrado','Heartbeat healthy','Fila normal','Evento teste recebido'],issues:[['Registro falha','Certificado ou DNS','Validar trust e resolução'],['Fila cresce','Capacidade insuficiente','Revisar sizing e volume']],log:['gateway=REGISTERED','heartbeat=HEALTHY','queue=3%','event_test=PASS'],url:'https://docs.imperva.com/bundle/v1-data-security-overview-and-integration-guide/page/79741.htm'},
 {title:'Agents',summary:'Selecione e registre métodos de monitoramento compatíveis.',objective:'Garantir cobertura de atividade e contexto nas fontes.',prereqs:['Coverage Tool consultado','OS e DB version conhecidos','Privilégios mínimos','Gateway healthy'],practices:['Validar tráfego local e remoto','Padronizar versões','Monitorar heartbeat','Planejar upgrade'],expected:'Agentes ou métodos registrados e enviando eventos.',flow:['Coverage','Install','Register','Heartbeat','Activity'],check:['Compatibilidade confirmada','Registro concluído','Heartbeat recebido','Atividade visível'],issues:[['Agente offline','Serviço ou comunicação','Revisar logs e rota'],['Cobertura parcial','Método inadequado','Adicionar método complementar']],log:['compatibility=PASS','agent=REGISTERED','heartbeat=3s','activity=VISIBLE'],url:'https://www.imperva.com/data-security-coverage-tool/'},
 {title:'Oracle Integration',summary:'Cadastre Oracle, contexto, serviços e políticas iniciais.',objective:'Proteger ORCLPRD e detectar atividades relevantes.',prereqs:['Oracle version suportada','Listener e services','RAC/Data Guard mapeados','Conta técnica mínima'],practices:['Monitorar SYS/SYSTEM','Mapear services e módulos','Testar local e remoto','Criar políticas de GRANT'],expected:'Oracle protegido, sessões visíveis e alertas funcionais.',flow:['Oracle','Discover','Collect','Normalize','Policy'],check:['Ativo cadastrado','Sessões visíveis','Objetos resolvidos','GRANT testado'],issues:[['Sessão local ausente','Cobertura insuficiente','Revisar método'],['RAC incompleto','Nó ou serviço ausente','Mapear todos os nós']],log:['ORCLPRD=PROTECTED','sessions=VISIBLE','objects=RESOLVED','grant_policy=MATCH'],url:'https://www.imperva.com/data-security-coverage-tool/'},
 {title:'SQL Server Integration',summary:'Cadastre SQL Server, autenticação, Always On e políticas.',objective:'Proteger SQLPROD01 e monitorar logins e server roles.',prereqs:['Versão suportada','Windows e autenticação mapeados','Listener/cluster conhecido','Conta técnica mínima'],practices:['Monitorar sa e sysadmin','Capturar application name','Testar failover','Revisar contas de serviço'],expected:'SQL Server protegido e alteração de sysadmin detectada.',flow:['SQL Server','Identity','Collect','Policy','SIEM'],check:['Instância cadastrada','Logins visíveis','Failover considerado','Sysadmin testado'],issues:[['Instância não descoberta','Porta ou browser','Usar endpoint explícito'],['Windows user ausente','Contexto incompleto','Revisar enriquecimento']],log:['SQLPROD01=PROTECTED','identity=VISIBLE','alwayson=MAPPED','sysadmin_policy=MATCH'],url:'https://www.imperva.com/data-security-coverage-tool/'},
 {title:'Policies',summary:'Crie escopo, condições, severidade, ações e exceções.',objective:'Publicar políticas precisas e operacionais.',prereqs:['Ativos protegidos','Riscos priorizados','Owners e SLA','Canais de resposta'],practices:['Testes positivo e negativo','Controlar exceções','Versionar mudanças','Medir falso positivo'],expected:'Políticas ativas com alertas e workflows validados.',flow:['Risk','Scope','Condition','Action','Test'],check:['Escopo definido','Severidade aprovada','Ações configuradas','Testes concluídos'],issues:[['Sem disparo','Condição ou escopo','Validar campos e ativos'],['Alert fatigue','Regra ampla','Refinar contexto e baseline']],log:['policy_scope=VALID','severity=APPROVED','positive_test=PASS','negative_test=PASS'],url:'https://docs.imperva.com/en-US/bundle/v14.9-database-activity-monitoring-user-guide/page/70414.htm'},
 {title:'Data Classification',summary:'Descubra, revise e publique categorias de dados sensíveis.',objective:'Identificar dados para uso em políticas e postura de risco.',prereqs:['Fontes acessíveis','Conta de discovery','Classificadores definidos','Owner dos dados'],practices:['Revisar falso positivo','Combinar nome e conteúdo','Registrar owner','Atualizar periodicamente'],expected:'CPF, cartões, e-mails e dados financeiros classificados.',flow:['Scan','Discover','Classify','Review','Publish'],check:['Scan concluído','Resultados revisados','Falsos positivos tratados','Classificação publicada'],issues:[['Sem metadados','Permissão insuficiente','Conceder mínimo necessário'],['Muitos falsos positivos','Classificador amplo','Refinar regras']],log:['scan=COMPLETED','findings=100','review=APPROVED','classification=PUBLISHED'],url:'https://www.imperva.com/products/data-security/'},
 {title:'Validation',summary:'Execute testes ponta a ponta e formalize o aceite.',objective:'Confirmar coleta, política, alerta, SIEM e relatório.',prereqs:['Componentes healthy','Casos de teste','Janela aprovada','Equipe de resposta disponível'],practices:['Registrar evidências','Testar sucesso e erro','Medir latência','Executar rollback simulado'],expected:'Aceite técnico e operacional assinado.',flow:['Activity','Policy','Alert','SIEM','Report'],check:['Evento recebido','Policy match','Alerta entregue','SIEM ACK','Relatório gerado'],issues:[['SIEM sem ACK','Integração ou token','Revisar autenticação'],['Evento incompleto','Normalização','Revisar contexto']],log:['activity=CAPTURED','policy=MATCH','alert=DELIVERED','siem=ACK','acceptance=PASS'],url:'https://docs.imperva.com/bundle/v1-data-security-overview-and-integration-guide/page/79737.htm'},
 {title:'Troubleshooting',summary:'Diagnostique fonte, agente, rede, Gateway e management.',objective:'Restaurar cobertura e preservar evidências.',prereqs:['Acesso a logs','Matriz de comunicação','Baseline de saúde','Procedimento de escalonamento'],practices:['Analisar por camadas','Não apagar evidências','Registrar horário e timezone','Gerar support bundle'],expected:'Causa identificada, serviço restaurado e ação documentada.',flow:['Source','Agent','Network','Gateway','Management'],check:['Fonte online','Agente healthy','Rede validada','Fila normal','Evento de teste recebido'],issues:[['Certificado expirado','TLS','Renovar e redistribuir'],['Fila elevada','Capacidade','Reduzir backlog e revisar sizing']],log:['source=ONLINE','agent=HEALTHY','network=PASS','gateway=HEALTHY','event_test=PASS'],url:'https://www.imperva.com/support/technical-support/'}
];
let currentInstall=0;let completedInstall=new Set(JSON.parse(localStorage.getItem('impervaInstallV2')||'[]'));
function renderInstallSteps(){const box=$('#installSteps');box.innerHTML=installationStages.map((x,i)=>`<button class="install-step ${i===currentInstall?'active':''} ${completedInstall.has(i)?'completed':''}" data-install-step="${i}"><i>${completedInstall.has(i)?'✓':String(i+1).padStart(2,'0')}</i><div><b>${x.title}</b><small>${x.summary}</small></div></button>`).join('');const p=Math.round(completedInstall.size/installationStages.length*100);$('#installPercent').textContent=p+'%'}
function openInstallStage(i){currentInstall=i;const d=installationStages[i];renderInstallSteps();$('#installPhase').textContent=`ETAPA ${String(i+1).padStart(2,'0')} DE ${installationStages.length}`;$('#installTitle').textContent=d.title;$('#installSummary').textContent=d.summary;$('#installObjective').textContent=d.objective;$('#installPrereqs').innerHTML=d.prereqs.map(x=>`<li>${x}</li>`).join('');$('#installPractices').innerHTML=d.practices.map(x=>`<li>${x}</li>`).join('');$('#installExpected').textContent=d.expected;$('#installOfficialLink').href=d.url;$('#installDiagram').innerHTML=d.flow.map((x,j)=>`${j?'<i>→</i>':''}<span>${x}</span>`).join('');$('#installChecklist').innerHTML=d.check.map((x,j)=>`<label><input type="checkbox" data-install-check="${j}">${x}</label>`).join('');$('#installIssues').innerHTML=d.issues.map(x=>`<div class="install-issue"><span><b>Problema</b>${x[0]}</span><span><b>Causa</b>${x[1]}</span><span><b>Ação recomendada</b>${x[2]}</span></div>`).join('');$('#installConsole').textContent='[READY] Aguardando execução.';$('#installState').textContent=completedInstall.has(i)?'COMPLETED':'READY';setInstallTab('overview')}
function setInstallTab(name){$$('#installTabs button').forEach(x=>x.classList.toggle('active',x.dataset.installTab===name));$$('.install-panel').forEach(x=>x.classList.remove('active'));$('#install-panel-'+name).classList.add('active')}
function runInstallPractice(){const d=installationStages[currentInstall];$('#installState').textContent='RUNNING';$('#installConsole').textContent='[START] '+d.title+'\n';let i=0;const t=setInterval(()=>{const line=d.log[i++];$('#installConsole').textContent+=`[CHECK] ${line} ........ PASS\n`;if(i===d.log.length){clearInterval(t);$('#installConsole').textContent+='[RESULT] VALIDATION SUCCESS\n';$('#installState').textContent='COMPLETED';completedInstall.add(currentInstall);localStorage.setItem('impervaInstallV2',JSON.stringify([...completedInstall]));renderInstallSteps();toast('Etapa validada e concluída.')}},300)}

const trainingPathsData=[
 {title:'Data Security Foundations',level:'FOUNDATION',desc:'Fundamentos de segurança de dados, DSF, DAM, arquitetura e governança.',modules:['Data Security','DSF Overview','DAM Concepts','Architecture','Compliance'],detail:'Indicada para profissionais que precisam compreender a proposta da plataforma e o fluxo de proteção de dados.'},
 {title:'DAM Administrator',level:'INTERMEDIATE',desc:'Implantação, onboarding, políticas, saúde, backup, upgrade e troubleshooting.',modules:['Management','Gateway','Agents','Oracle','SQL Server','Policies'],detail:'Foco operacional para administração diária, qualidade da coleta e resposta a problemas.'},
 {title:'Database Security Analyst',level:'ADVANCED',desc:'Investigação, risk analytics, dados sensíveis, playbooks e integração com SOC.',modules:['Classification','Risk','Investigation','SIEM','Reports'],detail:'Trilha para analistas de segurança, DBAs e equipes SOC que tratam incidentes de dados.'},
 {title:'Enterprise Demo Specialist',level:'PORTFOLIO',desc:'Cenários guiados para apresentações técnicas e demonstração de valor.',modules:['Oracle Demo','SQL Server Demo','Policy Studio','Investigation','Reports'],detail:'Utilize os Demo Scenarios desta academia para apresentar o fluxo completo de detecção e resposta.'}
];
function renderTrainingPaths(){$('#trainingPaths').innerHTML=trainingPathsData.map((x,i)=>`<article class="training-path card"><div class="training-path-head"><span class="label">LEARNING PATH ${String(i+1).padStart(2,'0')}</span><span class="level">${x.level}</span></div><h3>${x.title}</h3><p>${x.desc}</p><div class="training-modules">${x.modules.map(m=>`<span>${m}</span>`).join('')}</div><button class="btn secondary" data-training-path="${i}">Visualizar trilha</button><div class="training-path-detail hidden" id="training-detail-${i}">${x.detail}</div></article>`).join('')}


// ============================================================
// v3.0.0 Connections Center & About Platform
// ============================================================
const connectionState={oracle:{tested:false,privileges:false,enabled:false},sql:{tested:false,privileges:false,enabled:false}};
const connectionChecks={
 oracle:["DNS / hostname resolved","TCP 1521 reachable","Oracle Listener available","Service ORCLPRD registered","Monitoring credentials authenticated","Required privileges validated","Unified Audit context visible","Agent / Gateway heartbeat healthy"],
 sql:["DNS / hostname resolved","TCP 1433 reachable","SQL Server instance available","Monitoring login authenticated","Required permissions validated","SQL Audit context visible","Windows identity enrichment available","Agent / Gateway heartbeat healthy"]
};
function setConnectionTab(name){
 $$("#connectionTabs button").forEach(b=>b.classList.toggle("active",b.dataset.connectionTab===name));
 $$(".connection-panel").forEach(p=>p.classList.remove("active"));
 $("#connection-panel-"+name).classList.add("active");
}
function appendConnectionLog(message,type="INFO"){
 const out=$("#connectionLog"); if(!out)return;
 const time=new Date().toLocaleTimeString("pt-BR");
 out.textContent+=`[${time}] [${type}] ${message}\n`; out.scrollTop=out.scrollHeight;
}
function renderConnectionChecklists(){
 const build=(type)=>connectionChecks[type].map((x,i)=>`<div class="connection-check" data-${type}-check="${i}"><i>○</i><span>${x}</span><b>PENDING</b></div>`).join("");
 $("#oracleValidationChecklist").innerHTML=build("oracle");
 $("#sqlValidationChecklist").innerHTML=build("sql");
}
function updateConnectionKpis(){
 const online=(connectionState.oracle.enabled?1:0)+(connectionState.sql.enabled?1:0);
 $("#connectionsOnlineKpi").textContent=online; $("#connectionsWarningKpi").textContent=2-online;
 $("#connectionCoverage").textContent=Math.round(online/2*100)+"%";
 $("#connectionEventsRate").textContent=online===2?"1,248":online===1?"624":"0";
}
function animateWizard(type,step){
 const id=type==="oracle"?"#oracleWizardSteps":"#sqlWizardSteps";
 $$(id+" span").forEach((s,i)=>{s.classList.toggle("active",i<=step);s.classList.toggle("done",i<step)});
}
function connectionResult(type,data){
 const target=type==="oracle"?$("#oracleConnectionResult"):$("#sqlConnectionResult");
 target.className="connection-test-success";
 target.innerHTML=`<div class="connection-success-icon">✓</div><h4>CONNECTION SUCCESS</h4><div class="connection-result-grid">${data.map(x=>`<span>${x[0]}<b>${x[1]}</b></span>`).join("")}</div>`;
}
function testConnection(type){
 const state=connectionState[type], label=type==="oracle"?"Oracle ORCLPRD":"SQL Server SQLPROD01";
 const result=type==="oracle"?$("#oracleConnectionResult"):$("#sqlConnectionResult");
 const status=type==="oracle"?$("#oracleConnectionState"):$("#sqlConnectionState");
 result.className="connection-testing";result.innerHTML='<div class="pulse-icon">⌁</div><h4>Testing connectivity...</h4><p>DNS → TCP → Authentication → Database metadata</p>';
 status.textContent="TESTING";status.className="connection-state testing";animateWizard(type,4);appendConnectionLog(`${label}: connection test started`);
 setTimeout(()=>{
   state.tested=true; status.textContent="CONNECTED";status.className="connection-state connected";
   const data=type==="oracle"?[["Database","ORCLPRD"],["Version","Oracle Database 23ai (demo)"],["Listener","AVAILABLE"],["Latency","3 ms"],["Authentication","SUCCESS"],["Gateway","GW-01"]]:[["Instance","SQLPROD01"],["Version","SQL Server 2022 (demo)"],["TDS Endpoint","AVAILABLE"],["Latency","4 ms"],["Authentication","SUCCESS"],["Gateway","GW-01"]];
   connectionResult(type,data); appendConnectionLog(`${label}: connectivity and authentication SUCCESS`,"PASS");toast(label+" conectado com sucesso.");
   if(type==="oracle")$("#oracleLatency").textContent="3 ms"; else $("#sqlLatency").textContent="4 ms";
 },900);
}
function validatePrivileges(type){
 const state=connectionState[type], label=type==="oracle"?"Oracle ORCLPRD":"SQL Server SQLPROD01";
 if(!state.tested){toast("Execute primeiro o teste de conexão.","danger");return}
 appendConnectionLog(`${label}: validating minimum monitoring privileges`);
 setTimeout(()=>{state.privileges=true;animateWizard(type,3);appendConnectionLog(`${label}: privileges, audit context and metadata access PASS`,"PASS");toast("Privilégios e contexto de auditoria validados.")},600)
}
function enableMonitoring(type){
 const state=connectionState[type], label=type==="oracle"?"Oracle ORCLPRD":"SQL Server SQLPROD01";
 if(!state.tested||!state.privileges){toast("Teste a conexão e valide os privilégios antes de habilitar.","danger");return}
 const status=type==="oracle"?$("#oracleConnectionState"):$("#sqlConnectionState");
 appendConnectionLog(`${label}: enabling activity monitoring and policy assignment`);
 status.textContent="ENABLING";status.className="connection-state testing";
 setTimeout(()=>{state.enabled=true;status.textContent="MONITORING";status.className="connection-state connected";animateWizard(type,5);appendConnectionLog(`${label}: MONITORING ENABLED — events visible in Gateway`,"PASS");
   const node=type==="oracle"?$("#oracleHealthNode"):$("#sqlHealthNode");node.classList.add("online");node.querySelector("small").textContent="MONITORING";updateConnectionKpis();toast(label+" com monitoramento habilitado.")},800)
}
function runFullConnectionValidation(type){
 const box=type==="oracle"?$("#oracleValidationChecklist"):$("#sqlValidationChecklist"); const items=[...box.querySelectorAll(".connection-check")];
 appendConnectionLog(`${type.toUpperCase()}: full readiness validation started`);let i=0;
 const timer=setInterval(()=>{const item=items[i];item.classList.add("pass");item.querySelector("i").textContent="✓";item.querySelector("b").textContent="PASS";appendConnectionLog(`${type.toUpperCase()}: ${connectionChecks[type][i]} PASS`,"PASS");i++;if(i===items.length){clearInterval(timer);toast(`${type==="oracle"?"Oracle":"SQL Server"} readiness validation completed.`)}},220)
}
function validateAllConnections(){
 setConnectionTab("validation");runFullConnectionValidation("oracle");setTimeout(()=>runFullConnectionValidation("sql"),1900);appendConnectionLog("Enterprise environment validation requested");
}


document.addEventListener("DOMContentLoaded",()=>{
  $$(".nav-item").forEach(b=>b.onclick=()=>setView(b.dataset.view));
  if($("#connectionTabs")){
    renderConnectionChecklists();updateConnectionKpis();
    $("#connectionTabs").onclick=e=>{const b=e.target.closest("[data-connection-tab]");if(b)setConnectionTab(b.dataset.connectionTab)};
    $("#view-connections").onclick=e=>{const b=e.target.closest("[data-connection-action]");if(!b)return;const a=b.dataset.connectionAction;if(a==="oracle-test")testConnection("oracle");if(a==="sql-test")testConnection("sql");if(a==="oracle-privileges")validatePrivileges("oracle");if(a==="sql-privileges")validatePrivileges("sql");if(a==="oracle-enable")enableMonitoring("oracle");if(a==="sql-enable")enableMonitoring("sql");if(a==="oracle-full-validation")runFullConnectionValidation("oracle");if(a==="sql-full-validation")runFullConnectionValidation("sql")};
    $("#validateAllConnections").onclick=validateAllConnections;$("#clearConnectionLog").onclick=()=>{$("#connectionLog").textContent="[READY] Connection logs cleared.\n"};
  }$$("[data-go]").forEach(b=>b.onclick=()=>setView(b.dataset.go));$("#menuBtn").onclick=()=>$("#sidebar").classList.toggle("open");
  $("#unlockBtn").onclick=()=>{const n=$("#studentName").value.trim();if(n.length<3){toast("Digite seu nome completo.","danger");return}state.name=n;localStorage.setItem("impervaName",n);updateIdentity();toast("Trilha liberada com sucesso!")};
  $("#logoutBtn").onclick=()=>{localStorage.removeItem("impervaName");state.name="";updateIdentity();toast("Sessão local encerrada.")};
  $("#runOracle").onclick=()=>runLab("oracle",$("#oracleScenario").value);$("#runSql").onclick=()=>runLab("sql",$("#sqlScenario").value);
  $$("[data-oracle]").forEach(b=>b.onclick=()=>{const k=b.dataset.oracle;$("#oracleScenario").value=k;runLab("oracle",k)});$$("[data-sql]").forEach(b=>b.onclick=()=>{const k=b.dataset.sql;$("#sqlScenario").value=k;runLab("sql",k)});
  ["eventSearch","severityFilter","dbFilter"].forEach(id=>$("#"+id).addEventListener("input",renderEvents));$("#addEvent").onclick=()=>{events.unshift([new Date().toLocaleString("pt-BR"),Math.random()>.5?"Oracle":"SQL Server","DEMO_USER","SELECT SENSITIVE DATA","Demo Policy","HIGH","OPEN"]);renderEvents();toast("Novo evento simulado adicionado.")};
  $("#policiesGrid").onclick=e=>{const s=e.target.closest(".switch");if(s){e.stopPropagation();s.classList.toggle("on");localStorage.setItem(`policy${s.dataset.policy}`,s.classList.contains("on")?"on":"off");updatePolicyMetric();return}const c=e.target.closest("[data-policy-card]");if(c)openPolicyStudio(Number(c.dataset.policyCard))};
  $("#testPolicies").onclick=runGlobalPolicyTest;$("#closeGlobalPolicyTest").onclick=()=>$("#globalPolicyTestPanel").classList.add("hidden");
  ["policySearch","policySeverityFilter","policyDatabaseFilter"].forEach(id=>$("#"+id).addEventListener("input",renderPolicies));
  $("#closePolicyStudio").onclick=closePolicyStudio;$("#policyStudioBackdrop").onclick=closePolicyStudio;
  $("#policyTabs").onclick=e=>{const b=e.target.closest("[data-policy-tab]");if(b)setPolicyTab(b.dataset.policyTab)};
  $("#policySeveritySelector").onclick=e=>{const b=e.target.closest("[data-severity]");if(!b)return;currentPolicySeverity=b.dataset.severity;$$("#policySeveritySelector button").forEach(x=>x.classList.toggle("selected",x===b));$("#policyPreviewSeverity").textContent=currentPolicySeverity};
  $("#savePolicyBtn").onclick=()=>toast("Política salva na demonstração.");$("#openSimulationBtn").onclick=()=>setPolicyTab("simulation");$("#runPolicySimulation").onclick=runCurrentPolicySimulation;$("#resetPolicySimulation").onclick=resetPolicySimulation;
  $("#copyPolicyLogs").onclick=()=>{navigator.clipboard?.writeText($("#policyLogsOutput").textContent);toast("Logs copiados.")};
  $("#policyPlaybookSteps").onclick=e=>{const l=e.target.closest("[data-playbook-step]");if(!l)return;setTimeout(()=>{const i=Number(l.dataset.playbookStep),c=l.querySelector("input");c.checked?currentPlaybookDone.add(i):currentPlaybookDone.delete(i);l.classList.toggle("done",c.checked);$("#playbookProgress").textContent=currentPlaybookDone.size+"/5";$("#finishPlaybookBtn").classList.toggle("hidden",currentPlaybookDone.size!==5)},0)};$("#finishPlaybookBtn").onclick=()=>toast("Tratamento concluído e documentado.");
  renderIncidentList();
  $("#incidentList").onclick=e=>{const c=e.target.closest("[data-case]");if(c)openCase(Number(c.dataset.case))};
  $("#caseTabs").onclick=e=>{const b=e.target.closest("[data-case-tab]");if(b)setCaseTab(b.dataset.caseTab)};
  $("#runCaseSql").onclick=runCaseSql;$("#runAiAnalysis").onclick=runAiCase;
  $("#containmentActions").onclick=e=>{const b=e.target.closest("[data-contain]");if(!b)return;b.classList.add("executed");const name=b.querySelector("b").textContent;containmentHistory.push(new Date().toLocaleTimeString("pt-BR")+"  "+name+" — SUCCESS");$("#containmentLog").textContent=containmentHistory.join("\n");toast(name+" executado na simulação.",name.includes("Bloquear")||name.includes("Desabilitar")?"danger":"success")};
  $("#casePlaybookSteps").onclick=e=>{const l=e.target.closest("[data-case-step]");if(!l)return;setTimeout(()=>{const i=Number(l.dataset.caseStep),c=l.querySelector("input");c.checked?currentCasePlaybook.add(i):currentCasePlaybook.delete(i);l.classList.toggle("done",c.checked);$("#casePlaybookProgress").textContent=currentCasePlaybook.size+"/5";$("#finishInvestigation").classList.toggle("hidden",currentCasePlaybook.size!==5)},0)};
  $("#finishInvestigation").onclick=()=>{investigationCases[currentCaseIndex].status="COMPLETED";$("#reportDecision").textContent="ANÁLISE CONCLUÍDA";renderIncidentList();toast("Investigação concluída e relatório atualizado.")};
  $("#markLegitimate").onclick=()=>{$("#reportDecision").textContent="ATIVIDADE LEGÍTIMA";investigationCases[currentCaseIndex].decision="ATIVIDADE LEGÍTIMA";toast("Caso classificado como legítimo.")};
  $("#markConfirmed").onclick=()=>{$("#reportDecision").textContent="INCIDENTE CONFIRMADO";investigationCases[currentCaseIndex].decision="INCIDENTE CONFIRMADO";toast("Incidente confirmado e escalonado.","danger")};
  $("#printInvestigation").onclick=()=>window.print();
  $("#newInvestigationBtn").onclick=simulateNewIncident;$("#openNewIncidentBtn").onclick=openIncidentDetail;
  $("#closeIncidentDetail").onclick=closeIncidentDetail;$("#incidentDetailBackdrop").onclick=closeIncidentDetail;
  $("#assignIncidentBtn").onclick=assignCurrentIncident;$("#createIncidentTicketBtn").onclick=createIncidentTicket;$("#openIncidentWorkbenchBtn").onclick=openIncidentWorkbench;
  renderExtendedScenarios();$("#oracleExtendedScenarios").onclick=e=>{const b=e.target.closest("[data-oracle]");if(b){$("#oracleScenario").value=b.dataset.oracle;runLab("oracle",b.dataset.oracle)}};$("#sqlExtendedScenarios").onclick=e=>{const b=e.target.closest("[data-sql]");if(b){$("#sqlScenario").value=b.dataset.sql;runLab("sql",b.dataset.sql)}};terminalInit();$("#executeTerminal").onclick=()=>{execTerminal($("#terminalInput").value);$("#terminalInput").value=""};$("#terminalInput").onkeydown=e=>{if(e.key==="Enter")$("#executeTerminal").click()};$("#clearTerminal").onclick=terminalInit;$$(".quick-commands button").forEach(b=>b.onclick=()=>execTerminal(b.textContent));
  $("#submitQuiz").onclick=submitQuiz;
  $("#closeModuleModal").onclick=closeModuleActivity;
  $("#moduleModalBackdrop").onclick=closeModuleActivity;
  $("#startScenariosBtn").onclick=()=>{currentActivity.lesson=true;showActivityPanel("scenarioPanel");renderActivitySteps(2)};
  $("#moduleScenarioGrid").onclick=e=>{const b=e.target.closest("[data-activity-scenario]");if(b)executeActivityScenario(Number(b.dataset.activityScenario))};
  $("#goValidationBtn").onclick=()=>{showActivityPanel("validationPanel");renderActivitySteps(3)};
  $("#validateModuleBtn").onclick=validateCurrentModule;
  $("#finishModuleBtn").onclick=finishCurrentModule;
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("#moduleModal").classList.contains("hidden"))closeModuleActivity()});

  renderDocCategories();renderOfficialDocs();renderRecentActivity();renderReportTemplates();renderDemoScenarios();seedLiveStream();startMonitor();
  $("#docCategories").onclick=e=>{const b=e.target.closest("[data-doc]");if(b)openDocument(Number(b.dataset.doc))};
  $("#officialDocSearch").oninput=e=>renderOfficialDocs(e.target.value);
  $("#showFavoritesOnly").onclick=()=>{showOnlyFavorites=!showOnlyFavorites;$("#showFavoritesOnly").classList.toggle("active",showOnlyFavorites);$("#showFavoritesOnly").textContent=showOnlyFavorites?"★ Exibindo favoritos":"☆ Favoritos";renderOfficialDocs($("#officialDocSearch").value)};
  $("#officialDocsGrid").onclick=e=>{const f=e.target.closest("[data-favorite]");if(f){saveFavorite(f.dataset.favorite);return}const a=e.target.closest("[data-official-open]");if(a){const d=officialDocs.find(x=>x.id===a.dataset.officialOpen);if(d)addRecentActivity("Oficial: "+d.title,"documentation")}};
  $("#docFavorites").onclick=e=>{const b=e.target.closest("[data-open-official]");if(!b)return;const d=officialDocs.find(x=>x.id===b.dataset.openOfficial);if(d){addRecentActivity("Oficial: "+d.title,"documentation");window.open(d.url,"_blank","noopener")}};
  $("#recentActivity").onclick=e=>{const b=e.target.closest("[data-recent-view]");if(b)setView(b.dataset.recentView)};
  $("#docSearch").oninput=e=>renderDocCategories(e.target.value);
  $("#docTabs").onclick=e=>{const b=e.target.closest("[data-doc-tab]");if(b)setDocTab(b.dataset.docTab)};
  $("#docProcedure").onclick=e=>{const b=e.target.closest("[data-copy-doc]");if(!b)return;const text=documentationGuides[currentDocIndex].steps[Number(b.dataset.copyDoc)][2];navigator.clipboard?.writeText(text);toast("Trecho copiado.")};
  $("#runDocValidation").onclick=runDocValidation;
  $("#docChecklist").onclick=e=>{const l=e.target.closest("[data-doc-check]");if(!l)return;setTimeout(()=>{l.classList.toggle("done",l.querySelector("input").checked);const total=$("#docChecklist").querySelectorAll("input").length,done=$("#docChecklist").querySelectorAll("input:checked").length;$("#docChecklistProgress").textContent=`${done}/${total}`;if(done===total)toast("Checklist concluído.")},0)};
  $("#pauseMonitor").onclick=()=>{monitorPaused=!monitorPaused;$("#pauseMonitor").textContent=monitorPaused?'▶ Retomar':'Ⅱ Pausar';$("#streamStatusText").textContent=monitorPaused?'PAUSED':'STREAMING'};
  $("#injectMonitorEvent").onclick=()=>{addStreamRow(["ORCLPRD","SYSTEM","GRANT DBA","Privilege Escalation","CRITICAL"]);toast("Evento crítico injetado no stream.","danger")};
  $("#reportTemplates").onclick=e=>{const b=e.target.closest("[data-report]");if(!b)return;currentReportType=Number(b.dataset.report);renderReportTemplates()};
  $("#generateSelectedReport").onclick=generateReport;
  $("#printEnterpriseReport").onclick=()=>window.print();
  $("#copyReport").onclick=()=>{navigator.clipboard?.writeText($("#enterpriseReportPreview").innerText);toast("Resumo do relatório copiado.")};
  $("#demoScenariosGrid").onclick=e=>{const c=e.target.closest("[data-demo]");if(c)openDemo(Number(c.dataset.demo))};
  $("#nextDemoStep").onclick=nextDemo;$("#resetDemo").onclick=()=>{currentDemoStep=0;renderDemoPlayer()};$("#closeDemoPlayer").onclick=()=>$("#demoPlayer").classList.add("hidden");
  $("#globalSearchTrigger").onclick=openGlobalSearch;$("#globalSearchBackdrop").onclick=closeGlobalSearch;$("#globalSearchInput").oninput=e=>renderGlobalResults(e.target.value);$("#globalSearchResults").onclick=e=>{const r=e.target.closest("[data-search-view]");if(r){closeGlobalSearch();setView(r.dataset.searchView)}};
  document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openGlobalSearch()}if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='d'){e.preventDefault();setView("dashboard")}if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='i'){e.preventDefault();setView("investigation")}if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='l'){e.preventDefault();setView("monitoring")}if(e.key==='Escape'&&!$("#globalSearchModal").classList.contains('hidden'))closeGlobalSearch()});
  if($("#architectureFlowV2")){$("#architectureFlowV2").onclick=e=>{const b=e.target.closest("[data-arch]");if(b)renderArchitectureDetail(b.dataset.arch)};$("#archSimulateFlow").onclick=simulateArchitectureFlow;renderArchitectureDetail("gateway")}
  if($("#v2OfficialSearch")){$("#v2OfficialSearch").oninput=renderV2Official;$("#v2OfficialCategory").onchange=renderV2Official;renderV2Official()}
  if($("#downloadPackageGrid"))renderDownloadPackages();
  if($("#installSteps")){$("#installSteps").onclick=e=>{const b=e.target.closest("[data-install-step]");if(b)openInstallStage(Number(b.dataset.installStep))};$("#installTabs").onclick=e=>{const b=e.target.closest("[data-install-tab]");if(b)setInstallTab(b.dataset.installTab)};$("#runInstallPractice").onclick=runInstallPractice;openInstallStage(0)}
  if($("#trainingPaths")){renderTrainingPaths();$("#trainingPaths").onclick=e=>{const b=e.target.closest("[data-training-path]");if(!b)return;const d=$("#training-detail-"+b.dataset.trainingPath);d.classList.toggle("hidden");b.textContent=d.classList.contains("hidden")?"Visualizar trilha":"Ocultar detalhes"}}
  renderEvents();renderPolicies();renderQuiz();updateIdentity();
});