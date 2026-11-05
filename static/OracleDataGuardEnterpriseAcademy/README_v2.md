---
title: "Lab Data Guard 26ai — CDB/PDB, ASM, Grid Infrastructure"
tags: [oracle, dataguard, dgmgrl, rman, asm, 26ai, cdb, lab, dba]
versao_oracle: "23.26.1.0.0 (Oracle AI Database 26ai Enterprise Edition)"
data_execucao: "2026-07-10 a 2026-07-11"
ambiente: "VM única (ol9.localdomain), Oracle Restart/GI, ASM (DATA/RECO)"
status: "concluído — 8 testes práticos executados e validados"
---

# Lab Data Guard 26ai (23.26.x) — CDB/PDB, dois CDBs na mesma VM

Adaptação do lab para **Multitenant (CDB/PDB)**, com primary e standby na **mesma VM**, SGA baixa, uso descartável.

> **Regra de ouro do DG com Multitenant:** o Data Guard protege o **CDB inteiro**. Você não cria standby de um PDB isolado — todos os PDBs (inclusive PDB$SEED) são replicados junto. Se quiser excluir um PDB do standby, isso é feito com a cláusula `STANDBYS=NONE` na criação do PDB (Teste 2b).

## 📋 Índice / progresso

- [x] Passo 0 — Ambiente e planejamento de memória
- [x] Passo 1 — Diferenças CDB vs non-CDB
- [x] Passo 2 — Preparar o Primary (archivelog, flashback, SRLs)
- [x] Passo 3 — Password file, diretórios
- [x] Passo 4 — Rede (tnsnames, listener, standby em NOMOUNT)
- [x] Passo 5 — RMAN DUPLICATE
- [x] Passo 6 — DG Broker
- [x] Teste 1 — Replicação
- [x] Teste 2 — Resolver problema (archive gap)
- [x] Teste 2b — PDB fora do standby (STANDBYS=NONE)
- [x] Teste 3 — Switchover pelo Broker
- [x] Teste 4 — Failover + Reinstate
- [x] Teste 5 — FSFO com Observer
- [x] Teste 6 — Snapshot Standby
- [x] Teste 7 — Real Time Query (Active Data Guard)
- [x] Teste 8 — RMAN Archivelog Deletion Policy
- [x] Seção de Apoio ao DBA (queries de diagnóstico)
- [x] Limpeza pós-lab

---

## 0. Descubra seus valores atuais e planeje a memória

```bash
echo $ORACLE_SID
```
```sql
sqlplus / as sysdba
SELECT name, cdb, db_unique_name FROM v$database;
SELECT name, open_mode FROM v$pdbs;
SHOW PARAMETER sga_target
SHOW PARAMETER pga_aggregate_target
```

Valores confirmados deste ambiente (o control file `+DATA/ORCL/CONTROLFILE/current` mostra `db_unique_name=ORCL` em maiúsculo — o Oracle sempre normaliza assim internamente — mas o **SID do SO é minúsculo** (`orcl`), como revela o password file `orapworcl`). No Linux o `ORACLE_SID`, o password file, o pfile e o `SID_NAME` do listener são case-sensitive e precisam bater com o SID minúsculo; `db_name`, `db_unique_name` e os paths OMF ficam em maiúsculo. Confirme com `echo $ORACLE_SID`.

| Papel | db_name | db_unique_name | ORACLE_SID (SO) |
|---|---|---|---|
| Primary (o que já existe) | ORCL | ORCL | orcl |
| Standby (vamos criar) | ORCL | ORCLSB | orclsb |

**Storage: ASM.** Disk groups `DATA` (datafiles/controlfile/redo) e `RECO` (FRA, 9G). Nada de datafile em filesystem. O `audit_file_dest` aponta pra dentro do ORACLE_HOME (`.../rdbms/audit`), que já existe. Confirme com `SELECT name FROM v$asm_diskgroup;`.

**Conta de memória** (rode `free -h` para ver o RAM total):

- Cada instância CDB 26ai (code-base 23) abre confortável com `sga_target` a partir de ~1000-1200M. Abaixo de ~800M com vários PDBs você começa a tomar `ORA-04031`.
- Plano para VM apertada:
  - Primary: `sga_target=1300M`, `pga_aggregate_target=400M`
  - Standby: `sga_target=1000M`, `pga_aggregate_target=300M`
  - Total ≈ 3 GB + overhead de SO. Se o RAM for menor, baixe os dois proporcionalmente e **garanta swap** (`free -h` → coluna Swap).
- Use `sga_target` + `pga_aggregate_target`. **Não** use `memory_target` (AMM) aqui.

Encolher o primary agora (para caber os dois):

```sql
ALTER SYSTEM SET sga_target=1300M SCOPE=SPFILE;
ALTER SYSTEM SET pga_aggregate_target=400M SCOPE=SPFILE;
-- reinício acontece no passo 2
```

---

## 1. O que muda no CDB (versus non-CDB)

| Tema | Non-CDB | CDB |
|---|---|---|
| Unidade replicada | o banco | o CDB inteiro, todos os PDBs |
| Onde crio a tabela de teste | schema qualquer | dentro de um PDB (`ALTER SESSION SET CONTAINER`) |
| Abrir standby p/ leitura (ADG) | `ALTER DATABASE OPEN` | `OPEN` do root **+** `ALTER PLUGGABLE DATABASE ALL OPEN` |
| Excluir um membro do standby | n/a | `CREATE PLUGGABLE DATABASE ... STANDBYS=NONE` |
| Paths dos datafiles | simples | OMF no ASM (`+DATA/ORCL/<GUID>/...`); contêm o GUID do PDB e o `file_name_convert` troca só a parte do `db_unique_name` |
| Broker (dgmgrl) | igual | igual — opera no nível do CDB |

O resto (SRL, MRP0, modos de proteção, FAL, flashback) é idêntico ao lab non-CDB.

---

## 2. Preparar o Primary CDB

```bash
export ORACLE_SID=orcl
sqlplus / as sysdba
```
```sql
SELECT log_mode, force_logging, flashback_on FROM v$database;

SHUTDOWN IMMEDIATE;
STARTUP MOUNT;
ALTER DATABASE ARCHIVELOG;
ALTER DATABASE FLASHBACK ON;          -- essencial p/ reinstate após failover
ALTER DATABASE OPEN;
ALTER DATABASE FORCE LOGGING;
ALTER PLUGGABLE DATABASE ALL OPEN;

-- FRA já está em +RECO 9G neste ambiente; as duas linhas abaixo são idempotentes
ALTER SYSTEM SET db_recovery_file_dest_size=9G;
ALTER SYSTEM SET db_recovery_file_dest='+RECO';
ALTER SYSTEM SET standby_file_management=AUTO;
ALTER SYSTEM SET remote_login_passwordfile='EXCLUSIVE' SCOPE=SPFILE;
ALTER SYSTEM SET log_archive_config='DG_CONFIG=(ORCL,ORCLSB)';

-- Standby Redo Logs: (nº de grupos de redo) + 1, mesmo tamanho dos redos
SELECT group#, bytes/1024/1024 mb FROM v$log;
ALTER DATABASE ADD STANDBY LOGFILE GROUP 11 SIZE 200M;
ALTER DATABASE ADD STANDBY LOGFILE GROUP 12 SIZE 200M;
ALTER DATABASE ADD STANDBY LOGFILE GROUP 13 SIZE 200M;
ALTER DATABASE ADD STANDBY LOGFILE GROUP 14 SIZE 200M;

SHUTDOWN IMMEDIATE;
STARTUP;                              -- já aplica o sga_target novo
```

> Não configure `log_archive_dest_2` na mão — o broker faz isso. Se já estiver setado, limpe (`ALTER SYSTEM SET log_archive_dest_2='' SCOPE=BOTH;`) antes do `ENABLE CONFIGURATION`, senão dá `ORA-16714`.

---

## 3. Diretórios, password file, rede

```bash
# Com ASM não se cria diretório de datafile/FRA — o ASM cria +DATA/ORCLSB e
# +RECO/ORCLSB sozinho. E o adump aqui aponta pra dentro do próprio ORACLE_HOME
# (/u01/app/oracle/product/26.23.1/dbhome_1/rdbms/audit), que já existe — o
# standby herda esse audit_file_dest do primary, então não precisa de mkdir.
cp $ORACLE_HOME/dbs/orapworcl $ORACLE_HOME/dbs/orapworclsb
```

`tnsnames.ora` (no DB home; o connect identifier aponta pro **root** do CDB). Use o hostname real da VM, não `localhost` — o broker precisa dele para religar instância remota:

```ini
ORCL =
  (DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=ol9.localdomain)(PORT=1521))
    (CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=orcl)))

ORCLSB =
  (DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=ol9.localdomain)(PORT=1521))
    (CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=orclsb)))
```

`listener.ora` — **entradas estáticas `_DGMGRL` são obrigatórias** (sem elas o broker não reinicia a instância no switchover/failover, e o RMAN não conecta no auxiliary em NOMOUNT).

> **Atenção — ambiente Grid Infrastructure (Oracle Restart):** neste lab o listener roda do **grid home**, não do DB home. O arquivo fica em `/u01/app/26.23.1/grid/network/admin/listener.ora` e é gerenciado pelo agent do CRS. **Não** recrie o bloco `LISTENER=` (ele já existe e é mantido pelo agent) — apenas **anexe** o `SID_LIST_LISTENER` abaixo ao final do arquivo. O `ORACLE_HOME` das entradas aponta pro **DB home** (`.../dbhome_1`), porque as instâncias `orcl`/`orclsb` rodam de lá.

```ini
# anexar ao listener.ora do grid home (o bloco LISTENER= já existe, não mexer nele)
SID_LIST_LISTENER =
  (SID_LIST=
    (SID_DESC=(GLOBAL_DBNAME=ORCL_DGMGRL)
      (ORACLE_HOME=/u01/app/oracle/product/26.23.1/dbhome_1)(SID_NAME=orcl))
    (SID_DESC=(GLOBAL_DBNAME=ORCLSB_DGMGRL)
      (ORACLE_HOME=/u01/app/oracle/product/26.23.1/dbhome_1)(SID_NAME=orclsb))
    (SID_DESC=(GLOBAL_DBNAME=ORCLSB)
      (ORACLE_HOME=/u01/app/oracle/product/26.23.1/dbhome_1)(SID_NAME=orclsb)))
```

```bash
lsnrctl reload                       # carrega as estáticas; ok mesmo com listener do CRS
lsnrctl status | grep -i dgmgrl      # deve listar ORCL_DGMGRL e ORCLSB_DGMGRL
tnsping ORCLSB
```

---

## 4. Subir o standby em NOMOUNT

```bash
cat > $ORACLE_HOME/dbs/initorclsb.ora <<'EOF'
db_name='ORCL'
db_unique_name='ORCLSB'
EOF

export ORACLE_SID=orclsb
sqlplus / as sysdba <<'EOF'
STARTUP NOMOUNT PFILE='?/dbs/initorclsb.ora';
EOF
```

---

## 5. RMAN DUPLICATE (traz o CDB e todos os PDBs)

```bash
export ORACLE_SID=orcl
rman target sys/SuaSenha@ORCL auxiliary sys/SuaSenha@ORCLSB
```
```sql
RUN {
  ALLOCATE CHANNEL p1 TYPE DISK;
  ALLOCATE AUXILIARY CHANNEL s1 TYPE DISK;

  DUPLICATE TARGET DATABASE FOR STANDBY
    FROM ACTIVE DATABASE
    DORECOVER
    SPFILE
      SET db_unique_name='ORCLSB'
      SET db_create_file_dest='+DATA'
      SET db_recovery_file_dest='+RECO'
      SET db_recovery_file_dest_size='9G'
      SET control_files='+DATA','+RECO'
      SET db_file_name_convert='+DATA/ORCL','+DATA/ORCLSB','+RECO/ORCL','+RECO/ORCLSB'
      SET log_file_name_convert='+DATA/ORCL','+DATA/ORCLSB','+RECO/ORCL','+RECO/ORCLSB'
      SET log_archive_config='DG_CONFIG=(ORCL,ORCLSB)'
      SET fal_server='ORCL'
      SET standby_file_management='AUTO'
      SET sga_target='1000M'
      SET pga_aggregate_target='300M'
    NOFILENAMECHECK;
}
```

> **Sobre ASM/OMF aqui:** com `db_create_file_dest='+DATA'` e `db_recovery_file_dest='+RECO'` setados, o RMAN cria os arquivos do standby como OMF já sob `+DATA/ORCLSB/...` e `+RECO/ORCLSB/...`, gerando nomes novos. Os pares de `*_file_name_convert` cobrem tanto datafiles (`+DATA`) quanto redo/controlfile multiplexados no `+RECO`. O `control_files='+DATA','+RECO'` deixa o OMF nomear e multiplexar o controlfile nos dois disk groups. Os subdiretórios de GUID dos PDBs são preservados automaticamente.

Confira:
```bash
export ORACLE_SID=orclsb
sqlplus / as sysdba
```
```sql
SELECT db_unique_name, database_role, open_mode FROM v$database;
-- ORCLSB / PHYSICAL STANDBY / MOUNTED
```

---

## 6. DG Broker

Nos **dois** CDBs:
```sql
ALTER SYSTEM SET dg_broker_start=TRUE SCOPE=BOTH;
```

A partir do primary:
```bash
dgmgrl sys/SuaSenha@ORCL
```
```sql
CREATE CONFIGURATION 'dg_lab' AS PRIMARY DATABASE IS 'ORCL' CONNECT IDENTIFIER IS ORCL;
ADD DATABASE 'ORCLSB' AS CONNECT IDENTIFIER IS ORCLSB;
ENABLE CONFIGURATION;
SHOW CONFIGURATION;          -- aguarde ~30s até SUCCESS
VALIDATE DATABASE 'ORCLSB';
```
> **Nota de versão:** a cláusula `MAINTAINED AS PHYSICAL` (comum em tutoriais mais antigos) está **deprecated e foi removida** do parser do `dgmgrl` nesta versão — usá-la gera `Syntax error before or at "MAINTAINED"`. O broker detecta o papel do standby sozinho; basta o `ADD DATABASE ... AS CONNECT IDENTIFIER IS ...` sem a cláusula.

Abrir o standby em Active Data Guard (root **e** PDBs):
```sql
EDIT DATABASE 'ORCLSB' SET STATE='APPLY-OFF';
```
```sql
-- no ORCLSB
ALTER DATABASE OPEN;                 -- root READ ONLY
ALTER PLUGGABLE DATABASE ALL OPEN;   -- PDBs READ ONLY
```
```sql
EDIT DATABASE 'ORCLSB' SET STATE='APPLY-ON';   -- real-time apply com DB aberto
```

---

# TESTE 1 — Replicação (dentro de um PDB)

Seus PDBs são **ORCLPDB1** e **ORCLPDB2** (+ `PDB$SEED`). Uso o `ORCLPDB1` como PDB de trabalho; o `ORCLPDB2` também é replicado, então dá pra repetir a verificação nele trocando o `CONTAINER`.

Primary:
```sql
export ORACLE_SID=orcl
sqlplus / as sysdba
ALTER SESSION SET CONTAINER=ORCLPDB1;
CREATE TABLE system.t_dg (id NUMBER, dt DATE);
INSERT INTO system.t_dg SELECT level, sysdate FROM dual CONNECT BY level<=1000;
COMMIT;
ALTER SYSTEM SWITCH LOGFILE;    -- no CDB$ROOT: ALTER SESSION SET CONTAINER=CDB$ROOT; antes
```

Standby:
```sql
export ORACLE_SID=orclsb
sqlplus / as sysdba
ALTER SESSION SET CONTAINER=ORCLPDB1;
SELECT count(*) FROM system.t_dg;    -- 1000
```
```sql
-- apply vivo?
ALTER SESSION SET CONTAINER=CDB$ROOT;
SELECT process, status, sequence# FROM v$managed_standby WHERE process LIKE 'MRP%';
SELECT name, value FROM v$dataguard_stats;   -- transport/apply lag = 0
```
```sql
DGMGRL> SHOW CONFIGURATION LAG;
```

**Extra CDB — replicar um PDB novo.** No primary:
```sql
ALTER SESSION SET CONTAINER=CDB$ROOT;
CREATE PLUGGABLE DATABASE pdb_novo ADMIN USER a IDENTIFIED BY a;
ALTER PLUGGABLE DATABASE pdb_novo OPEN;
```
No standby, segundos depois, `pdb_novo` aparece em `v$pdbs` (por padrão `STANDBYS=ALL`). Com `standby_file_management=AUTO`, os datafiles são criados sozinhos.

**Sucesso:** lag 0, `count(*)=1000`, e `pdb_novo` visível no standby.

---

# TESTE 2 — Resolver problema (archive gap + roll-forward por SCN)

Idêntico ao lab non-CDB; a única diferença é como você lê o SCN mais baixo (agora considere o CDB todo).

### 2.1 Provocar
```sql
DGMGRL> EDIT DATABASE 'ORCLSB' SET STATE='APPLY-OFF';
```

> **Gerencie start/stop do standby sempre via `dgmgrl`, não via SQL*Plus direto.** Se você derrubar/religar a instância standby com `SHUTDOWN`/`STARTUP` no SQL*Plus por fora do broker, o `Intended State` do DMON fica dessincronizado do estado real e o broker passa a recusar comandos com `ORA-16688: command cannot be issued on a disabled member`. O fix, se acontecer, é reconectar **a partir do primary** (`dgmgrl` com `ORACLE_SID=orcl`) e rodar `ENABLE DATABASE 'ORCLSB';` seguido de `EDIT DATABASE 'ORCLSB' SET STATE='APPLY-ON';` — reparei que o `ENABLE DATABASE` só reconcilia de forma confiável quando executado a partir da conexão com o primary, não conectado direto no standby.

```sql
DGMGRL> SHUTDOWN IMMEDIATE;
```

> **Confirme que a instância morreu de verdade** antes de seguir — enquanto ela estiver de pé (mesmo com `APPLY-OFF`), os processos `ARCH`/RFS continuam recebendo e catalogando redo normalmente, e **não há como gerar gap**: o standby vai buscar tudo via FAL assim que o apply for religado, mesmo que os arquivos sejam apagados depois no primary. `ps -ef | grep pmon_orclsb` não deve retornar nada.

```sql
-- primary: gerar redo (o suficiente para os grupos de redo darem a volta e o
-- archive ficar dependente só da cópia arquivada, não do redo online)
export ORACLE_SID=orcl
sqlplus / as sysdba
ALTER SESSION SET CONTAINER=CDB$ROOT;
BEGIN
  FOR i IN 1..15 LOOP
    EXECUTE IMMEDIATE 'ALTER SYSTEM SWITCH LOGFILE';
  END LOOP;
END;
/
```

> **Descoberta de laboratório — o RMAN se recusa, em silêncio, a apagar archivelog que o standby ainda precisa.** Rodar `DELETE NOPROMPT ARCHIVELOG ALL` aqui **não gera erro nenhum e parece ter funcionado**, mas o RMAN, ao perceber que existe um standby configurado em `log_archive_config` que ainda não confirmou apply daquelas sequências, simplesmente **pula** esses archivelogs — sem avisar. Conferindo depois com `SELECT sequence#, name, deleted, status FROM v$archived_log WHERE sequence# BETWEEN X AND Y AND dest_id=1;`, os arquivos continuam com `DELETED=NO`, `STATUS=A` e o `NAME` ainda apontando pro `+RECO`. É uma proteção real do RMAN integrado ao Data Guard — e é exatamente o tipo de rede de segurança que evita gap acidental em produção. Para fins do teste (provocar o gap de propósito), é preciso ignorá-la explicitamente com `FORCE`:

```bash
rman target /
```
```sql
DELETE FORCE NOPROMPT ARCHIVELOG SEQUENCE BETWEEN <primeira> AND <ultima> THREAD 1;
```

Confirme que sumiu de vez:
```sql
SELECT sequence#, name, deleted, status FROM v$archived_log WHERE sequence# BETWEEN <primeira> AND <ultima> AND dest_id=1;
-- esperado: DELETED=YES, STATUS=D (ou a linha nem aparece mais)
```

Só então religue o standby, **via broker**:
```sql
DGMGRL> STARTUP MOUNT;
```

### 2.2 Diagnosticar
```sql
export ORACLE_SID=orclsb
sqlplus / as sysdba
SELECT * FROM v$archive_gap;
SELECT MIN(fhscn) FROM x$kcvfh;     -- SCN mais baixo dos datafiles (CDB todo)
```
```sql
DGMGRL> VALIDATE DATABASE 'ORCLSB';   -- mostra gap e "Ready for Failover: No"
```
Alert log do standby: `FAL[client]: Failed to request gap sequence`.

### 2.3 Corrigir
```bash
# primary: incremental a partir do SCN + controlfile p/ standby
mkdir -p /tmp/fordg
export ORACLE_SID=orcl
rman target /
```
```sql
BACKUP INCREMENTAL FROM SCN <SCN_do_2.2> DATABASE FORMAT '/tmp/fordg/inc_%U';
BACKUP CURRENT CONTROLFILE FOR STANDBY FORMAT '/tmp/fordg/ctl_%U';
```
```bash
export ORACLE_SID=orclsb
rman target /
```
```sql
SHUTDOWN IMMEDIATE;
STARTUP NOMOUNT;
RESTORE STANDBY CONTROLFILE FROM '/tmp/fordg/ctl_xxxx';
ALTER DATABASE MOUNT;
CATALOG START WITH '/tmp/fordg/' NOPROMPT;
RECOVER DATABASE NOREDO;
```
```sql
DGMGRL> EDIT DATABASE 'ORCLSB' SET STATE='APPLY-ON';
DGMGRL> VALIDATE DATABASE 'ORCLSB';
```
**Sucesso:** `SUCCESS`, lag 0.

---

# TESTE 2b — Problema exclusivo de CDB: PDB fora do standby (STANDBYS=NONE)

Simula o cenário em que alguém cria um PDB no primary excluído do standby, e depois você precisa trazê-lo pra dentro da proteção.

Primary:
```sql
ALTER SESSION SET CONTAINER=CDB$ROOT;
CREATE PLUGGABLE DATABASE pdb_orfao ADMIN USER a IDENTIFIED BY a STANDBYS=NONE;
ALTER PLUGGABLE DATABASE pdb_orfao OPEN;
```

No standby, esse PDB fica com os datafiles **offline / com recovery desabilitado** — o redo dele é descartado. Confirme:
```sql
-- standby
ALTER SESSION SET CONTAINER=CDB$ROOT;
SELECT pdb_name, status FROM cdb_pdbs;        -- pdb_orfao lá, mas datafiles offline
SELECT name, recovery_status FROM v$pdbs;     -- DISABLED
```

**Trazer para o standby** (procedimento oficial): copiar os datafiles do PDB do primary para o standby e habilitar recovery:
```sql
-- standby, root
ALTER PLUGGABLE DATABASE pdb_orfao ENABLE RECOVERY;
```
Depois é preciso restaurar/copiar os datafiles do PDB (via RMAN `RESTORE ... PLUGGABLE DATABASE pdb_orfao` a partir de um backup, ou copiar os arquivos e recatalogar), reiniciar o apply e o MRP recupera o resto. Ao final:
```sql
SELECT name, recovery_status FROM v$pdbs;     -- ENABLED
```
**Lição:** `STANDBYS=NONE` é a forma de excluir PDB do DG; reverter exige recuperar os datafiles manualmente. Em produção, evite a menos que intencional.

---

## 📒 Descobertas de laboratório — Testes 1 e 2

Registro do que aconteceu de fato na execução real deste lab (não é teoria de manual — foi vivido e resolvido aqui). Vale tanto quanto os testes roteirizados.

> [!bug] Incidente #1 — Broker marcou o standby como "disabled" após restart manual
> **Sintoma:** `ORA-16688: command cannot be issued on a disabled member` ao rodar `VALIDATE DATABASE`; `SHOW DATABASE` mostrando `Intended State: OFFLINE` e `Database Status: SHUTDOWN - ORA-16906: The member was shutdown`.
> **Causa:** a instância standby foi parada e religada (`SHUTDOWN`/`STARTUP MOUNT`) **direto no SQL*Plus**, por fora do broker. O DMON nunca foi avisado da intenção de trazê-la de volta, então manteve o `Intended State` como `OFFLINE`.
> **Tentativa que falhou:** `ENABLE DATABASE 'ORCLSB'` conectado direto no standby → `ORA-16626: failed to enable specified member`.
> **Fix que funcionou:** reconectar o `dgmgrl` **a partir do primary** (`ORACLE_SID=orcl`) e rodar `ENABLE DATABASE 'ORCLSB';` seguido de `EDIT DATABASE 'ORCLSB' SET STATE='APPLY-ON';`.
>
> **Lição dupla:** (1) sempre gerenciar start/stop do standby via `dgmgrl` (`STARTUP`/`SHUTDOWN`), nunca SQL*Plus direto, para manter o `Intended State` sincronizado; (2) comandos de reconciliação de membro (`ENABLE DATABASE`) são mais confiáveis quando executados a partir da conexão com o **primary**, não conectado direto no membro problemático.

> [!info] Descoberta #2 — RMAN recusa, em silêncio, apagar archivelog que o standby ainda precisa
> **O que aconteceu:** ao tentar provocar um gap de propósito (Teste 2), `DELETE NOPROMPT ARCHIVELOG ALL` no primary **rodou sem erro** — mas não apagou nada. Confirmado com `SELECT sequence#, name, deleted, status FROM v$archived_log WHERE ...`: todas as sequências continuaram com `DELETED=NO`, `STATUS=A`, arquivo físico intacto em `+RECO`.
> **Causa:** o RMAN, ciente da configuração `log_archive_config` com um standby registrado, **protege por padrão** os archivelogs que aquele standby ainda não confirmou ter aplicado — mesmo com `NOPROMPT`. Não emite erro, apenas pula esses arquivos.
> **Como forçar (só para fins de teste/lab):** `DELETE FORCE NOPROMPT ARCHIVELOG SEQUENCE BETWEEN x AND y THREAD 1;`
> **Detalhe extra:** mesmo apagando os archivelogs, o gap só se concretiza se o **redo online** também não tiver mais o dado (os grupos de redo precisam ter dado a volta e sobrescrito as sequências em questão) — e a instância standby precisa estar **totalmente desligada** (não só `APPLY-OFF`) durante a janela, senão ela recebe e cataloga o redo mesmo sem aplicar.
>
> **Lição de produção: essa mesma proteção do RMAN é exatamente o que evita gap acidental em ambientes reais.** Rotinas de limpeza de archivelog num ambiente com Data Guard normalmente não precisam (e não devem) usar `FORCE` — é bom lembrar antes de rodar isso em produção pensando que "não fez nada" quando na real o RMAN estava te protegendo.

---

# TESTE 3 — Switchover pelo Broker

```bash
dgmgrl sys/SuaSenha@ORCL
```
```sql
SHOW CONFIGURATION;
VALIDATE DATABASE 'ORCLSB';    -- quer "Ready for Switchover: Yes"
SWITCHOVER TO 'ORCLSB';
```
O broker converte papéis e reinicia as instâncias via listener estático (~1-2 min). Os PDBs sobem sozinhos no novo primary.

Validar:
```sql
-- ORCLSB (agora primary)
SELECT database_role FROM v$database;      -- PRIMARY
ALTER PLUGGABLE DATABASE ALL OPEN;
ALTER SESSION SET CONTAINER=ORCLPDB1;
INSERT INTO system.t_dg VALUES (9999, sysdate); COMMIT;
```
```sql
-- ORCL (agora standby), depois de reabrir em ADG
ALTER SESSION SET CONTAINER=ORCLPDB1;
SELECT count(*) FROM system.t_dg WHERE id=9999;   -- 1
```

Voltar (totalmente simétrico — repita quantas vezes quiser):
```bash
dgmgrl sys/SuaSenha@ORCL
```
```sql
SWITCHOVER TO 'ORCL';
```

> [!tip] Switchover não depende de qual instância você conectou
> `dgmgrl usuario/senha@ALIAS` conecta **via TNS/rede**, então basta o alias resolver para qualquer membro da configuração `dg_lab` — uma vez conectado, você enxerga a configuração inteira e pode disparar `SWITCHOVER TO '<nome_do_alvo>'` para **qualquer** dos dois bancos, não importa em qual você conectou. Por isso `SWITCHOVER TO 'ORCLSB'` seguido depois de `SWITCHOVER TO 'ORCL'` funciona simetricamente, ida e volta, sem restrição.
>
> **Nota sobre `ORACLE_SID`:** `export ORACLE_SID=X` só importa para conexões *locais* (`sqlplus / as sysdba`, sem `@alias`, que usa socket/shared memory). Em `dgmgrl usuario/senha@ALIAS` ou `sqlplus usuario/senha@ALIAS`, a conexão é via TNS e o `ORACLE_SID` exportado no shell é irrelevante — pode estar setado para qualquer coisa, ou nem estar setado.

---

# TESTE 4 — Failover + Reinstate

```bash
export ORACLE_SID=orcl
sqlplus -s / as sysdba <<< "SHUTDOWN ABORT"
```
```bash
dgmgrl sys/SuaSenha@ORCLSB
```
```sql
SHOW CONFIGURATION;
FAILOVER TO 'ORCLSB';
SHOW CONFIGURATION;          -- ORCL: "Disabled / needs reinstatement"
```
Reinstate do antigo primary (funciona por causa do `FLASHBACK ON`):
```bash
sqlplus / as sysdba <<< "STARTUP MOUNT"   # SID=ORCL
```
```sql
DGMGRL> REINSTATE DATABASE 'ORCL';
DGMGRL> SHOW CONFIGURATION;
```
Depois volte com `SWITCHOVER TO 'ORCL'`.

> [!tip] `ENABLE DATABASE` vs `REINSTATE DATABASE` — por que são comandos diferentes
> Os dois "destravam" um membro marcado como problemático no broker, mas resolvem causas completamente diferentes — entender a diferença é entender a diferença entre um incidente administrativo e um failover de verdade.
>
> **`ENABLE DATABASE`** (usado no Incidente #1 acima) resolve um problema de **sincronização de estado no broker**. O banco em si está saudável — mount, dados corretos, timeline correta. O único problema é que o `Intended State` do DMON ficou dessincronizado (ex.: acha que devia estar `OFFLINE` quando devia estar `ONLINE`), geralmente porque a instância foi parada/religada por fora do broker. É um comando puramente administrativo: não mexe em dados, só corrige a percepção do broker sobre o que o banco deveria estar fazendo.
>
> **`REINSTATE DATABASE`** (usado agora, pós-failover) resolve algo bem mais sério: **divergência de timeline**. O banco que acabou de perder o papel de primary (aqui, `ORCLSB`) tinha uma linha do tempo de redo própria até o instante da queda. Quando o sobrevivente assumiu via `FAILOVER`, ele criou uma **nova incarnation** a partir daquele ponto. O banco antigo, ao religar, ainda está preso na timeline velha — literalmente um banco de dados numa realidade que deixou de existir, podendo até ter transações que o novo primary nunca viu. Por isso o `REINSTATE` precisa fazer muito mais que o `ENABLE`: usa o **Flashback Database** para rebobinar o banco até o SCN exato onde as timelines divergem, descarta o que não bate com a nova realidade, e só então reconverte o papel para standby — não é destravar, é reconstruir a identidade do banco na timeline correta.
>
> **Régua de decisão rápida:**
> - Banco certo, timeline certa, só o broker "achando" que está desligado → `ENABLE DATABASE`
> - Banco que foi primary numa timeline que não existe mais (pós-failover) → `REINSTATE DATABASE`
>
> É exatamente por isso que o `ALTER DATABASE FLASHBACK ON` (Passo 2 e Passo 6 deste guia) importa tanto: sem ele, `REINSTATE` não é possível, e a única saída após um failover seria recriar o standby inteiro do zero via novo `DUPLICATE`.

---

# TESTE 5 — FSFO com Observer (opcional)

**FSFO (Fast-Start Failover):** automação do failover pelo broker. Sem FSFO, promover o standby é decisão humana (`FAILOVER TO`, como no Teste 4). Com FSFO habilitado, o broker monitora continuamente e, se o primary ficar inacessível por mais que `FastStartFailoverThreshold` segundos, promove o standby **sozinho**.

**Observer:** processo `dgmgrl` externo que monitora o primary de forma independente do standby. Existe para evitar **split-brain**: sem ele, o standby não teria como distinguir "primary morreu" de "só a rede entre nós dois caiu, e o primary segue vivo pra outros clientes". O failover automático só dispara quando **standby E observer concordam**. Em produção, roda numa terceira máquina; no lab de VM única, roda localmente — funciona para o teste, mas anula a proteção real contra split-brain (limitação conhecida do lab).

**Pré-requisito:** FSFO exige `MaxAvailability`, que exige transporte `SYNC` (não o `ASYNC`/`MaxPerformance` usado até aqui).

Neste ponto, `orcl` é o primary (pós Teste 3/4). Todos os comandos de configuração rodam conectado nele.

**1) Transporte síncrono nos dois lados** — pré-requisito de `MaxAvailability`:
```bash
export ORACLE_SID=orcl
dgmgrl sys/SuaSenha@ORCL
```
```sql
EDIT DATABASE 'ORCLSB' SET PROPERTY LogXptMode='SYNC';
EDIT DATABASE 'orcl'   SET PROPERTY LogXptMode='SYNC';
```
*O que faz:* muda o modo de transporte de `ASYNC` (LGWR não espera confirmação do standby) para `SYNC` (commit só confirma no cliente depois do standby confirmar recebimento). É o que torna aceitável promover o standby automaticamente sem checar perda de dados — em `ASYNC` o FSFO simplesmente não é permitido.

**2) Configurar e habilitar o FSFO** (mesma sessão):
```sql
EDIT DATABASE 'orcl'   SET PROPERTY FastStartFailoverTarget='ORCLSB';
EDIT DATABASE 'ORCLSB' SET PROPERTY FastStartFailoverTarget='orcl';
```
*O que faz:* declara, em cada membro, quem é o parceiro de failover automático — precisa ser espelhado nos dois lados porque, depois de um FSFO, os papéis invertem e o alvo também precisa inverter.

```sql
EDIT CONFIGURATION SET PROTECTION MODE AS MaxAvailability;
```
*O que faz:* eleva o protection mode da configuração inteira. Só aceita se o standby já estiver confirmando redo em SYNC — por isso rodamos o passo 1 antes.

```sql
EDIT CONFIGURATION SET PROPERTY FastStartFailoverThreshold=30;
```
*O que faz:* define em segundos quanto tempo o broker tolera não conseguir falar com o primary antes de considerar failover. 30s é curto de propósito, para o teste não exigir espera longa; em produção o valor costuma ser maior, para tolerar blips de rede sem promover à toa.

```sql
ENABLE FAST_START FAILOVER;
SHOW FAST_START FAILOVER;
```
*O que faz:* ativa o mecanismo e mostra o estado — confira `Protection Mode: MaxAvailability`, `Active Target` apontando pro parceiro certo, e (antes do observer) `Observer: (none)`.

**3) Observer** — terminal **separado** (simula a terceira máquina):
```bash
dgmgrl sys/SuaSenha@ORCL "START OBSERVER"
```
*O que faz:* inicia o processo de monitoramento independente, em foreground (bloqueia o terminal — deixe a janela aberta). Sem isso, o FSFO fica configurado mas nunca dispara sozinho, por design (proteção contra split-brain sem segunda testemunha).

Confirme em outra sessão:
```bash
export ORACLE_SID=orcl
dgmgrl sys/SuaSenha@ORCL
```
```sql
SHOW FAST_START FAILOVER;
```
*Esperado:* `Observer:` deixa de mostrar `(none)` e passa a mostrar o hostname/processo conectado.

**4) Provocar a queda e observar o failover automático:**
```bash
export ORACLE_SID=orcl
sqlplus -s / as sysdba <<< "SHUTDOWN ABORT"
```
*O que esperar:* em até `FastStartFailoverThreshold` segundos (aqui, 30s), o Observer e o standby concordam que o primary sumiu, e o broker promove `ORCLSB` sozinho — sem qualquer comando manual. Quando o antigo primary (`orcl`) for religado, `Auto-reinstate: TRUE` faz o broker reintegrá-lo como standby automaticamente, sem precisar do `REINSTATE DATABASE` manual do Teste 4.

Para desligar o mecanismo depois do teste:
```sql
DISABLE FAST_START FAILOVER;
```
(no terminal do Observer) `Ctrl+C` ou:
```sql
STOP OBSERVER;
```

> [!tip] O que o FSFO automatiza — e o que continua manual
> No lab, `SHUTDOWN ABORT` no primary disparou o failover automático (Observer + standby decidiram e promoveram sozinhos, dentro do `FastStartFailoverThreshold`) — mas religar a instância caída (`STARTUP MOUNT`) precisou de ação manual antes do auto-reinstate completar sozinho. Isso não é falha do teste, é a divisão de responsabilidades real do mecanismo:
>
> | Camada | Responsabilidade | Quem faz |
> |---|---|---|
> | Instância física ligada/desligada | Ligar o processo no SO | Clusterware/GI (via seus próprios agents) ou operador manual — **fora do escopo do FSFO** |
> | Decisão de promover o standby | Detectar queda, confirmar com o Observer, promover | **FSFO + Observer** (automático) |
> | Reintegrar o banco religado como standby | Reconhecer, converter papel, religar apply | **Auto-reinstate** (automático, mas só depois que a instância estiver de pé) |
>
> O FSFO cuida da parte mais crítica (decidir e promover sem esperar humano), mas não substitui o Clusterware/GI como camada de recuperação de instância. Um `SHUTDOWN ABORT` manual pode inclusive não ser tratado pelo agent do GI como "falha a corrigir" (dependendo da configuração), diferente de uma queda real de processo — por isso, no lab, a instância ficou parada até religarmos manualmente.

---

# TESTE 6 — Snapshot Standby (bônus)

**Teoria técnica:** converte o standby físico em banco **read-write independente e temporário** — útil para testar algo (patch, migração, validação de app) com dados reais e atualizados, sem tocar no primary. Enquanto nesse modo, continua **recebendo** redo do primary (armazena, não aplica). Ao reverter, tudo que foi alterado durante a janela é **descartado** via Flashback Database, e o redo acumulado é aplicado de uma vez, trazendo o standby de volta ao normal.

```bash
dgmgrl sys/SuaSenha@ORCL
```
```sql
CONVERT DATABASE 'ORCLSB' TO SNAPSHOT STANDBY;
```
*O que faz:* usa Flashback Database para guardar um ponto de restauração e converte o `database_role` para `SNAPSHOT STANDBY`. Exige `FLASHBACK ON` (configurado no Passo 2).

> [!warning] Discrepância observada nesta versão (26ai / 23.26.1.0.0)
> A documentação padrão do `CONVERT DATABASE TO SNAPSHOT STANDBY` sugere que o banco já fica em `READ WRITE` após o comando. **Não foi o que aconteceu neste lab:** o `CONVERT` completou com sucesso e mudou o `database_role` para `SNAPSHOT STANDBY`, mas o `open_mode` ficou em `MOUNTED` — precisou de um `ALTER DATABASE OPEN` manual em seguida para abrir de fato em `READ WRITE`. Registrado aqui porque é uma diferença real de comportamento testada nesta versão, não suposição — se você seguir outros guias que não mencionam esse passo extra, não se surpreenda se precisar abrir manualmente.

```sql
export ORACLE_SID=orclsb
sqlplus / as sysdba
SELECT database_role, open_mode FROM v$database;   -- SNAPSHOT STANDBY / MOUNTED (nesta versão)
ALTER DATABASE OPEN;                                -- necessário nesta versão
SELECT database_role, open_mode FROM v$database;   -- SNAPSHOT STANDBY / READ WRITE
```

Teste no PDB — cria dado que só deve existir durante a janela:
```sql
ALTER SESSION SET CONTAINER=ORCLPDB1;
CREATE TABLE system.teste_snapshot AS SELECT * FROM system.t_dg;
SELECT count(*) FROM system.teste_snapshot;
```

Reverter:
```sql
DGMGRL> CONVERT DATABASE 'ORCLSB' TO PHYSICAL STANDBY;
```
*O que faz:* descarta via flashback tudo criado durante a janela read-write (a `teste_snapshot` deve sumir), aplica o redo acumulado do primary, standby volta ao papel normal.

Confirmar que a mudança foi descartada:
```sql
export ORACLE_SID=orclsb
sqlplus / as sysdba
ALTER SESSION SET CONTAINER=ORCLPDB1;
SELECT * FROM system.teste_snapshot;   -- esperado: ORA-00942 (tabela não existe)
```

---

# TESTE 7 — Real Time Query (Active Data Guard)

**Teoria:** abre o standby em `READ ONLY` enquanto o `MRP0` continua aplicando redo em tempo real. É o uso mais comum de Data Guard em produção — offload de relatórios/consultas pesadas do primary sem atraso perceptível, sem interromper o apply.

```bash
export ORACLE_SID=orclsb
sqlplus / as sysdba
```
```sql
SELECT open_mode FROM v$database;      -- confirma MOUNTED antes de abrir
ALTER DATABASE OPEN;
ALTER PLUGGABLE DATABASE ALL OPEN;
SELECT database_role, open_mode FROM v$database;   -- PHYSICAL STANDBY / READ ONLY
```
*O que faz:* abre o CDB$ROOT e todos os PDBs em modo leitura, sem desligar o `MRP0` — os dois convivem.

Consulta real, com o apply ainda rodando:
```sql
ALTER SESSION SET CONTAINER=ORCLPDB1;
SELECT count(*) FROM system.t_dg;
SELECT process, status, sequence# FROM v$managed_standby WHERE process LIKE 'MRP%';   -- MRP0 continua APPLYING_LOG
```

Prova definitiva — inserir no primary e ler no standby aberto, sem reconectar nem reabrir:
```sql
-- no primary
export ORACLE_SID=orcl
sqlplus / as sysdba
ALTER SESSION SET CONTAINER=ORCLPDB1;
INSERT INTO system.t_dg VALUES (5000, sysdate); COMMIT;
```
```sql
-- de volta na sessão do standby, já aberta
SELECT * FROM system.t_dg WHERE id=5000;
```
*Esperado:* o registro aparece em segundos — é a confirmação de que o dado flui do primary para uma consulta em aberto no standby, sem qualquer intervenção.

> [!tip] Como confirmar que o Real Time Query está realmente em modo tempo real (e não só "aberto")
> `ALTER DATABASE OPEN` num standby abre para leitura, mas isso sozinho não garante que o apply seja *em tempo real* (aplicando direto do redo recebido, sem esperar o archive completar). Para confirmar o modo exato:
> ```sql
> SELECT dest_id, status, database_mode, recovery_mode FROM v$archive_dest_status WHERE status != 'INACTIVE';
> ```
> `recovery_mode = MANAGED REAL TIME APPLY` confirma tempo real de verdade; `MANAGED` (sem `REAL TIME`) indica apply só a partir do redo já arquivado, com latência maior.

---

# TESTE 8 — RMAN Archivelog Deletion Policy (proteção formal para ambiente com standby)

**Contexto:** no Teste 2 descobrimos que o RMAN, por padrão implícito, se recusa a apagar archivelog que um standby ainda não aplicou — mas isso não é uma política configurada, é comportamento incidental. Este teste torna essa proteção **explícita e documentada**, que é como deveria estar configurado desde o primeiro dia em qualquer ambiente de produção com Data Guard.

```bash
export ORACLE_SID=orcl
rman target /
```
```sql
CONFIGURE ARCHIVELOG DELETION POLICY TO APPLIED ON ALL STANDBY;
```
**O que esse comando faz:** não apaga nada e não abre/fecha banco — é uma mudança de **configuração persistente do RMAN**, gravada no controlfile, valendo para todas as sessões futuras. A partir daqui, todo `DELETE ARCHIVELOG` só considera um archivelog elegível para exclusão depois que **todos os standbys da configuração** confirmarem apply daquela sequência.

**Resultado real obtido no lab:**
```
old RMAN configuration parameters:
CONFIGURE ARCHIVELOG DELETION POLICY TO NONE;
new RMAN configuration parameters:
CONFIGURE ARCHIVELOG DELETION POLICY TO APPLIED ON ALL STANDBY;
new RMAN configuration parameters are successfully stored
```
Confirma que antes não havia política nenhuma — a proteção vista na Descoberta #2 era comportamento incidental do RMAN ciente do Data Guard, não uma configuração formal. Agora está.

```sql
SHOW ARCHIVELOG DELETION POLICY;
```
*O que faz:* só lê e mostra a política atual — não altera nada.

Validar via SQL:
```sql
SELECT name, value FROM v$rman_configuration WHERE name LIKE '%DELETION%';
```

Teste prático — confirme que, mesmo `FORCE` não sendo mais necessário, `DELETE` respeita a política:
```sql
DELETE NOPROMPT ARCHIVELOG ALL COMPLETED BEFORE 'SYSDATE-7';
```
*O que esperar:* o RMAN só remove o que está fora da janela de 7 dias **e** já aplicado em todos os standbys — mesmo comando de limpeza de rotina, agora com a garantia formal.

---

## 🛠️ Seção de Apoio ao DBA — Queries de Diagnóstico

Referência rápida para monitoramento e troubleshooting do dia a dia com Data Guard. Organizada por categoria — não é teoria, são as consultas que resolvem problema real.

### Status geral (primeira coisa a rodar em qualquer investigação)
```sql
-- Papel, modo de abertura e proteção — funciona mesmo com MRP parado
SELECT db_unique_name, database_role, open_mode, protection_mode, switchover_status
FROM   v$database;
```
```sql
DGMGRL> SHOW CONFIGURATION;
DGMGRL> SHOW DATABASE VERBOSE 'ORCLSB';
```
*Por quê:* `SHOW CONFIGURATION` dá o resumo de saúde de toda a topologia em uma tela; `VERBOSE` detalha um membro específico, incluindo propriedades e o resultado do último health check do broker (que roda automaticamente a cada 1 minuto).

### Lag — transporte e apply
```sql
SELECT name, value, unit, time_computed
FROM   v$dataguard_stats
WHERE  name IN ('transport lag','apply lag','apply finish time');
```
*Por quê:* é a fonte mais confiável de lag, funciona em MOUNT (sem precisar do ADG aberto). **Sempre observe `time_computed`** — o valor é um snapshot, não tempo real; se `time_computed` for antigo, o dado está desatualizado (sinal de que algo travou).
```sql
DGMGRL> SHOW CONFIGURATION LAG;
```
*Por quê:* mesma informação, via broker, formatada para leitura rápida.

### Processos ativos do Data Guard
```sql
SELECT process, status, thread#, sequence#, block#, blocks
FROM   v$managed_standby
WHERE  process IN ('MRP0','RFS','ARCH');
```
*Por quê:* mostra o que cada processo está fazendo agora. Estados do MRP0 que importam: `APPLYING_LOG` (saudável), `WAIT_FOR_LOG` (esperando o próximo archivelog — normal em picos baixos de redo), `WAIT_FOR_GAP` (há gap real bloqueando — vá para a seção de Gap abaixo).

### Gap de arquivamento
```sql
-- No standby: mostra APENAS o próximo gap que está bloqueando o apply
SELECT * FROM v$archive_gap;
```
*Por quê:* atenção — essa view só mostra **um** gap por vez (o que está bloqueando agora). Depois de resolver, rode de novo; se houver outro gap atrás, ele só aparece na próxima consulta.
```sql
-- No primary: visão completa de o que foi arquivado/aplicado por destino
SELECT dest_id, status, destination, error, archived_seq#, applied_seq#
FROM   v$archive_dest_status
WHERE  status != 'INACTIVE';
```
*Por quê:* mostra por destino (`dest_id`) até onde chegou o archived e o applied — útil quando há múltiplos standbys ou para confirmar que o `dest_id` do standby está `VALID`, não `ERROR`.

### Erros e eventos do broker
```sql
SELECT timestamp, message
FROM   v$dataguard_status
WHERE  severity IN ('Error','Fatal')
ORDER  BY timestamp DESC
FETCH FIRST 20 ROWS ONLY;
```
*Por quê:* é o log estruturado do Data Guard — pega o que normalmente só apareceria vasculhando o alert log manualmente. **Primeiro lugar a olhar quando algo parece errado e não se sabe por onde começar.**

### Redo logs e standby redo logs
```sql
SELECT group#, bytes/1024/1024 mb, 'ONLINE' tipo FROM v$log
UNION ALL
SELECT group#, bytes/1024/1024 mb, 'STANDBY' tipo FROM v$standby_log
ORDER  BY 3, 1;
```
*Por quê:* confirma que os SRLs existem, têm o mesmo tamanho dos redo logs online, e segue a regra (grupos de redo + 1). Falta de SRL é causa comum de `MRP0` não iniciar.

### Verificar se o Real Time Query (ADG) está realmente ativo
```sql
SELECT dest_id, status, database_mode, recovery_mode
FROM   v$archive_dest_status
WHERE  status != 'INACTIVE';
```
*Por quê:* `recovery_mode = MANAGED REAL TIME APPLY` confirma apply em tempo real com o standby aberto; `MANAGED` (sem `REAL TIME`) indica que o apply só processa o redo já arquivado — mais lento para refletir mudanças.

### RMAN — política de archivelog segura para ambiente com standby
```sql
CONFIGURE ARCHIVELOG DELETION POLICY TO APPLIED ON ALL STANDBY;
```
*Por quê:* é a configuração correta de produção — instrui o RMAN a **nunca apagar** um archivelog até que **todos** os standbys registrados confirmem apply. Evita depender da proteção implícita do `DELETE` (que existe, mas não é a forma documentada/suportada de garantir isso) e torna explícito para qualquer outro DBA que olhar a config depois.
```sql
-- conferir a política atual
SELECT name, value FROM v$rman_configuration WHERE name LIKE '%DELETION%';
```

### Espaço — ASM e datafiles (checagem antes de qualquer DUPLICATE/expansão)
```bash
asmcmd lsdg
```
```sql
SELECT round(SUM(bytes)/1024/1024/1024,2) gb_datafiles FROM v$datafile;
SELECT round(SUM(bytes)/1024/1024/1024,2) gb_temp      FROM v$tempfile;
```
*Por quê:* compare o `Free_MB` do disk group de destino com o footprint real do primary **antes** de rodar `DUPLICATE` ou adicionar um novo standby — economiza um troubleshooting inteiro.

### Verificar incarnation (útil após failover/reinstate)
```sql
SELECT incarnation#, resetlogs_change#, resetlogs_time, status
FROM   v$database_incarnation
ORDER  BY incarnation# DESC;
```
*Por quê:* cada failover cria uma nova incarnation (nova timeline de redo). Se um `REINSTATE` ou `RECOVER` falhar de forma estranha, confira aqui se os bancos estão na mesma linhagem — a coluna `status='CURRENT'` marca a timeline ativa.

---

## Checklist de saúde — rotina rápida

```sql
DGMGRL> SHOW CONFIGURATION LAG;
DGMGRL> VALIDATE DATABASE 'ORCL';
DGMGRL> VALIDATE DATABASE 'ORCLSB';
```
```sql
SELECT process, status, sequence# FROM v$managed_standby;
SELECT name, value FROM v$dataguard_stats;
SELECT name, open_mode, recovery_status FROM v$pdbs;
SELECT * FROM v$archive_gap;
```

---

## Remover o standby (limpeza pós-lab)

```sql
DGMGRL> DISABLE FAST_START FAILOVER;
DGMGRL> REMOVE CONFIGURATION;
```
```bash
export ORACLE_SID=orclsb
sqlplus -s / as sysdba <<< "SHUTDOWN ABORT"

# Arquivos do standby estão no ASM — remova pelos disk groups (conecte no +ASM):
export ORACLE_SID=+ASM
asmcmd rm -rf +DATA/ORCLSB
asmcmd rm -rf +RECO/ORCLSB

# pfile e password file do standby (o adump é compartilhado no HOME, não apagar):
export ORACLE_SID=orclsb
rm -f $ORACLE_HOME/dbs/*orclsb*
rm -f $ORACLE_HOME/dbs/initorclsb.ora
```
No primary, voltar ao normal:
```sql
export ORACLE_SID=orcl
sqlplus / as sysdba
ALTER SYSTEM SET log_archive_dest_2='' SCOPE=BOTH;
ALTER SYSTEM SET log_archive_config='' SCOPE=BOTH;
ALTER SYSTEM SET dg_broker_start=FALSE SCOPE=BOTH;
-- opcional: devolver a SGA/PGA originais deste ambiente (capturadas antes do lab)
ALTER SYSTEM SET sga_target=2848M SCOPE=SPFILE;
ALTER SYSTEM SET pga_aggregate_target=949M SCOPE=SPFILE;
-- (backup do pfile original está em $ORACLE_HOME/dbs/pfile_orig.ctl)
-- opcional: desligar flashback/force logging se não usava antes
-- ALTER DATABASE FLASHBACK OFF;
-- ALTER DATABASE NO FORCE LOGGING;
```
Remova as entradas `ORCLSB` do `tnsnames.ora` e do `listener.ora` e `lsnrctl reload`.

