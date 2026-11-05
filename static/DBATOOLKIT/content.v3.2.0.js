const CONTENT = {
  "categories": [
    {
      "id": "oracle",
      "name": "Oracle",
      "color": "#C74634",
      "topics": [
        {
          "id": "archivelog",
          "title": "Habilitar Archivelog",
          "tags": [
            "archivelog",
            "backup",
            "rman"
          ],
          "description": "Ativa o modo de archivelog no banco para permitir backups online e recuperação point-in-time.",
          "sections": [
            {
              "type": "warning",
              "text": "O banco precisa ser reiniciado. Planeje uma janela de manutenção."
            },
            {
              "type": "steps",
              "title": "Passo a passo",
              "items": [
                {
                  "label": "Conecte como SYSDBA",
                  "command": "sqlplus / as sysdba"
                },
                {
                  "label": "Verifique o status atual",
                  "command": "SELECT LOG_MODE FROM V$DATABASE;"
                },
                {
                  "label": "Defina um diretório para os archives",
                  "command": "ALTER SYSTEM SET log_archive_dest_1='location=<LOCAL ARCHIVES>' SCOPE=spfile;"
                },
                {
                  "label": "Configurar nomenclatura dos archives",
                  "command": "ALTER SYSTEM SET log_archive_format='<INSTANCIA>_%t_%s_%r.arc' scope=spfile;"
                },
                {
                  "label": "Desligue o banco de forma limpa",
                  "command": "SHUTDOWN IMMEDIATE;"
                },
                {
                  "label": "Suba em modo mount",
                  "command": "STARTUP MOUNT;"
                },
                {
                  "label": "Habilite o archivelog",
                  "command": "ALTER DATABASE ARCHIVELOG;"
                },
                {
                  "label": "Abra o banco",
                  "command": "ALTER DATABASE OPEN;"
                },
                {
                  "label": "Confirme que está ativo",
                  "command": "SELECT LOG_MODE FROM V$DATABASE;"
                }
              ]
            }
          ]
        },
        {
          "id": "redolog-multiplexar",
          "title": "Multiplexar Redo Logs",
          "tags": [
            "redolog",
            "multiplexar",
            "segurança"
          ],
          "description": "Adiciona membros extras aos grupos de redo log para proteção contra perda de dados.",
          "sections": [
            {
              "type": "info",
              "text": "Multiplexar redo logs é uma boa prática. Em caso de falha de disco, o Oracle continua usando os membros restantes."
            },
            {
              "type": "steps",
              "title": "Passo a passo",
              "items": [
                {
                  "label": "Liste os grupos e membros existentes",
                  "command": "SELECT GROUP#, MEMBER FROM V$LOGFILE ORDER BY GROUP#;"
                },
                {
                  "label": "Adicione um membro ao grupo 1",
                  "command": "ALTER DATABASE ADD LOGFILE MEMBER '/u02/oradata/redo01b.log' TO GROUP 1;"
                },
                {
                  "label": "Adicione um membro ao grupo 2",
                  "command": "ALTER DATABASE ADD LOGFILE MEMBER '/u02/oradata/redo02b.log' TO GROUP 2;"
                },
                {
                  "label": "Adicione um membro ao grupo 3",
                  "command": "ALTER DATABASE ADD LOGFILE MEMBER '/u02/oradata/redo03b.log' TO GROUP 3;"
                },
                {
                  "label": "Confirme a multiplexação",
                  "command": "SELECT GROUP#, MEMBER, STATUS FROM V$LOGFILE ORDER BY GROUP#;"
                }
              ]
            },
            {
              "type": "tip",
              "text": "Coloque os membros em discos físicos diferentes para garantir redundância real."
            }
          ]
        },
        {
          "id": "locks-oracle",
          "title": "Verificar e Matar Locks",
          "tags": [
            "lock",
            "bloqueio",
            "sessão",
            "kill session"
          ],
          "description": "Identifica sessões bloqueando outras e encerra o lock quando necessário.",
          "sections": [
            {
              "type": "warning",
              "text": "Matar uma sessão faz rollback automático das transações pendentes. Confirme com o time de negócio antes."
            },
            {
              "type": "steps",
              "title": "Passo a passo",
              "items": [
                {
                  "label": "Liste sessões com lock",
                  "command": "col \"Sessao\" for a55\nset lines 150\ncol username for a30\n SELECT DECODE(l.request, 0, 'Holder: ', 'Waiter: ') ||' alter system kill session '''||l.sid ||','|| s.serial#||',@'||s.inst_id||''';' \"Sessao\",\n        s.serial#,\n        substr(s.username,1,30) Username,\n        l.id1,        l.id2,        l.lmode,        l.request,        l.type\n   FROM GV$LOCK L, GV$SESSION S\n  WHERE (l.id1, l.id2, l.type) IN\n        (SELECT l2.id1, l2.id2, l2.type FROM GV$LOCK l2 WHERE l2.request > 0)\n    AND s.sid = l.sid\n  ORDER BY l.id1, l.request;"
                },
                {
                  "label": "Encerre a sessão bloqueadora (substitua SID e SERIAL#)",
                  "command": "ALTER SYSTEM KILL SESSION 'SID,SERIAL#' IMMEDIATE;"
                }
              ]
            }
          ]
        },
        {
          "id": "tablespace-espaco",
          "title": "Verificar Espaço em Tablespaces",
          "tags": [
            "tablespace",
            "espaço",
            "disco",
            "crescimento"
          ],
          "description": "Monitora o uso de espaço nas tablespaces para evitar surpresas em produção.",
          "sections": [
            {
              "type": "steps",
              "title": "Passo a passo",
              "items": [
                {
                  "label": "Espaço livre por tablespace",
                  "command": "set lines 200 \nset pages 100 \ncol pdb for a20\ncolumn \"Tablespace\" format A30 \ncolumn \"Usado\" format '9999,990.00' \ncolumn \"Livre\" format '9999,990.00' \ncolumn \"Expansivel\" format A12 \ncolumn \"Total\" format '9999,990.00' \ncolumn \"Usado %\" format '990.00'\ncolumn \"Livre %\" format '990.00' \ncolumn \"Tipo Ger.\" format A12 \n\n\nselect t.tablespace_name \"Tablespace\", round(ar.usado, 2) \"Usado\",\nround(decode(NVL2(cresc.tablespace, 0, sign(ar.Expansivel)),1, (ar.livre + ar.expansivel), ar.livre), 2) \"Livre\",\nround(ar.alocado,2) \"Alocado Mb\", NVL2(cresc.limite, 'ILIMITADO', round(ar.expansivel, 2)) \"Expansivel\",\nround(decode(NVL2(cresc.tablespace, 0, sign(ar.Expansivel)), 1, ar.usado / (ar.total + ar.expansivel), (ar.usado / ar.total)) * 100, 2) \"Usado %\",\nround(decode(NVL2(cresc.tablespace, 0, sign(ar.Expansivel)), 1, (ar.livre + ar.expansivel) / (ar.total + ar.expansivel), (ar.livre / ar.total)) * 100, 2) \"Livre %\",\nround(decode(NVL2(cresc.tablespace, 0, sign(ar.Expansivel)), 1, (ar.total + ar.expansivel), ar.total), 2) \"Total\",\nt.Contents \"Conteudo\", t.Extent_Management \"Tipo Ger.\" \nfrom dba_tablespaces t, (select df.tablespace_name tablespace, \nsum(nvl(df.user_bytes,0))/1024/1024 Alocado, (sum(df.bytes) - sum(NVL(df_fs.bytes, 0))) / 1024 / 1024 Usado, \nsum(NVL(df_fs.bytes, 0)) / 1024 / 1024 Livre, sum(decode(df.autoextensible, 'YES', decode(sign(df.maxbytes - df.bytes), 1, \ndf.maxbytes - df.bytes, 0), 0)) / 1024 / 1024 Expansivel, sum(df.bytes) / 1024 / 1024 Total from dba_data_files df, \n(select tablespace_name, file_id, sum(bytes) bytes from dba_free_space group by tablespace_name, file_id) df_fs \nwhere df.tablespace_name = df_fs.tablespace_name(+) and df.file_id = df_fs.file_id(+) \ngroup by df.tablespace_name \nunion \nselect tf.tablespace_name tablespace, sum(nvl(tf.user_bytes,0))/1024/1024 Alocado, \nsum(tf_fs.bytes_used) / 1024 / 1024 Usado, sum(tf_fs.bytes_free) / 1024 / 1024 Livre,\nsum(decode(tf.autoextensible, 'YES', decode(sign(tf.maxbytes - tf.bytes), 1, tf.maxbytes - tf.bytes, 0), 0)) / 1024 / 1024 Expansivel, \nsum(tf.bytes) / 1024 / 1024 Total from dba_temp_files tf, V$TEMP_SPACE_HEADER tf_fs\nwhere tf.tablespace_name = tf_fs.tablespace_name and tf.file_id = tf_fs.file_id \ngroup by tf.tablespace_name) ar, (select df.tablespace_name tablespace, 'ILIMITADO' limite\nfrom dba_data_files df where df.maxbytes / 1024 / 1024 > 32760 and df.autoextensible = 'YES' \ngroup by df.tablespace_name union select tf.tablespace_name tablespace, 'ILIMITADO' limite \nfrom dba_temp_files tf where tf.maxbytes / 1024 / 1024 > 32760 and tf.autoextensible = 'YES' \ngroup by tf.tablespace_name) cresc where cresc.tablespace(+) = t.tablespace_name and ar.tablespace(+) = t.tablespace_name order by 7;"
                },
                {
                  "label": "Datafiles com autoextend",
                  "command": "SELECT\n  tablespace_name,\n  file_name,\n  ROUND(bytes/1024/1024) AS size_mb,\n  autoextensible,\n  ROUND(maxbytes/1024/1024) AS max_mb\nFROM dba_data_files\nORDER BY tablespace_name;"
                },
                {
                  "label": "Listar todos os datafiles e tamanhos de uma tablespace",
                  "command": "select FILE_NAME, sum(MAXBYTES/1024/1024) from dba_data_files where TABLESPACE_NAME='<TablespaceName>' group by FILE_NAME order by 1;"
                },
                {
                  "label": "Alterar o Maxsize de um datafile",
                  "command": "Alter database datafile '<Datafile>' autoextend on next 500m maxsize <maxsize>;"
                },
                {
                  "label": "Adicionar datafile a tablespace (Com autoextend e maxsize)",
                  "command": "alter tablespace <TablespaceName> add datafile '<dir/datafile>' size 200m autoextend on next 500m maxsize 30000m;"
                }
              ]
            }
          ]
        },
        {
          "id": "sessoes-ativas",
          "title": "Sessões Ativas",
          "description": "Exibe sessões ativas com detalhes de usuário, máquina, programa, SQL_ID e tempo desde a última atividade.",
          "tags": [
            "sessão",
            "sessões ativas",
            "performance",
            "monitoramento"
          ],
          "sections": [
            {
              "type": "info",
              "text": "A query filtra apenas sessões ACTIVE. Retire o filtro `AND s.status = 'ACTIVE'` para ver também sessões inativas."
            },
            {
              "type": "steps",
              "title": "Passo a passo",
              "items": [
                {
                  "label": "Listar sessões ativas com detalhes de usuário, máquina e tempo",
                  "command": "set pagesize 200\nset linesize 200\nset pause off\nset verify off\ncol inst           format 99\ncol username       format a12\ncol os_pid         format 9999999\ncol sessao         format a12\ncol machine        format a30\ncol programa       format a30 truncate\ncol machine_osuser format a40 truncate heading \"MACHINE: OSUSER\"\ncol log_time       format a10  heading 'HORARIO|DO LOGIN' justify right\ncol inicio_ult_cmd format a14 heading 'TEMPO ATIVO|OU INATIVO' justify right\ncol module         format a30\ncol status         format a8\n\nselect s.inst_id inst,\n       s.username,\n       to_number(p.spid) as os_pid,\n       '''' || to_char(s.sid) || ',' || to_char(s.serial#) || '''' as sessao,\n       s.machine || ': ' || s.osuser as machine_osuser,\n       SUBSTR(SUBSTR(s.program,INSTR(s.program,'\\',-1)+1),1,30) as programa,\n       decode( trunc(sysdate-s.logon_time),            -- dias conectado\n               0, to_char(s.logon_time,'hh24:mi:ss'),  -- se menos de um dia\n                  to_char(trunc(sysdate-s.logon_time, 1), 'fm99.0') || ' dias'\n             ) as log_time,\n       decode( trunc(last_call_et/86400),  -- 86400 seg = 1 dia\n               0, '     ',                 -- se 0 dias, coloca brancos\n                  to_char(trunc(last_call_et/60/60/24), '0') || 'd, ')\n       || to_char( to_date(mod(last_call_et, 86400), 'SSSSS'),\n                              'hh24\"h\"MI\"m\"SS\"s\"'\n                 ) as inicio_ult_cmd,\n       SUBSTR(SUBSTR(s.module,INSTR(s.module,'\\',-1)+1),1,30)   as module,\n           s.sql_id,\n       decode(status, 'ACTIVE', 'ATIVO',\n                      'INACTIVE', 'INATIVO',\n                      status) as status\nfrom gv$session s, gv$process p\nwhere s.username is not null\nand s.inst_id = p.inst_id\nand s.paddr = p.addr\nand s.status = 'ACTIVE'\norder by inicio_ult_cmd, status, s.username;\n\nset feedback 6"
                }
              ]
            }
          ]
        },
        {
          "id": "bind-variables",
          "title": "Capturar Bind Variables",
          "description": "Recupera os valores capturados das bind variables de um SQL_ID para facilitar a análise de consultas parametrizadas.",
          "tags": [
            "bind variable",
            "sql_id",
            "tuning",
            "performance"
          ],
          "sections": [
            {
              "type": "tip",
              "text": "Os valores são capturados de forma amostral pelo Oracle. Se `value_string` estiver nulo, a captura ainda não ocorreu para esse SQL."
            },
            {
              "type": "steps",
              "title": "Passo a passo",
              "items": [
                {
                  "label": "Consultar valores das bind variables de um SQL_ID",
                  "command": "SELECT name, position, datatype_string, value_string, last_captured\nFROM v$sql_bind_capture\nWHERE sql_id = '&sql_id';"
                }
              ]
            }
          ]
        },
        {
          "id": "limite-processos-sessoes",
          "title": "Alterar Limite de Processos e Sessões",
          "description": "Aumenta os parâmetros `processes` e `sessions` quando o banco está atingindo o limite máximo de conexões.",
          "tags": [
            "processes",
            "sessions",
            "limite",
            "conexões",
            "spfile"
          ],
          "sections": [
            {
              "type": "warning",
              "text": "É necessário reiniciar o banco para aplicar. Planeje uma janela de manutenção."
            },
            {
              "type": "steps",
              "title": "Passo a passo",
              "items": [
                {
                  "label": "Verificar os limites atuais e o pico de utilização",
                  "command": "-- Processes:\nSELECT limit_value, max_utilization FROM v$resource_limit WHERE resource_name = 'processes';\n\n-- Sessions:\nSELECT limit_value, max_utilization FROM v$resource_limit WHERE resource_name = 'sessions';"
                },
                {
                  "label": "Aumentar o limite (ajuste os valores conforme necessário)",
                  "command": "-- Processes:\nALTER SYSTEM SET processes = 1000 SCOPE = spfile;\n\n-- Sessions:\nALTER SYSTEM SET sessions = 1000 SCOPE = spfile;"
                },
                {
                  "label": "Fazer backup do spfile e reiniciar o banco",
                  "command": "-- Backup do spfile antes de reiniciar\nCREATE PFILE = '/tmp/pfile_backup.ora' FROM SPFILE;\n\n-- Desligar o banco\nSHUTDOWN IMMEDIATE;\n\n-- Iniciar o banco\nSTARTUP;"
                }
              ]
            }
          ]
        },
        {
          "id": "resize-datafile",
          "title": "Resize de Datafiles",
          "description": "Reduz datafiles com espaço alocado mas sem utilização — comum após TRUNCATE TABLE ou expurgo de dados.",
          "tags": [
            "tablespace",
            "datafile",
            "espaço em disco",
            "resize",
            "high water mark"
          ],
          "sections": [
            {
              "type": "warning",
              "text": "Nunca reduza abaixo do high water mark. A query já calcula o mínimo seguro — execute apenas os comandos gerados por ela."
            },
            {
              "type": "steps",
              "title": "Passo a passo",
              "items": [
                {
                  "label": "Gerar os comandos ALTER DATABASE para reduzir cada datafile ao mínimo seguro",
                  "command": "SET LINES 200\nSET PAGES 100\nCOL FILE_NAME FOR a100\nCOL SMALLEST FOR a100\n\nSELECT 'ALTER DATABASE DATAFILE ''' || file_name || ''' RESIZE ' ||\n       CEIL( (NVL(hwm,1)*8192)/1024/1024+1 ) || 'm;' smallest,\n       CEIL( blocks*8192/1024/1024 ) currsize,\n       CEIL( blocks*8192/1024/1024 ) -\n       CEIL( (NVL(hwm,1)*8192)/1024/1024 ) savings\nFROM dba_data_files a,\n     ( SELECT file_id, MAX(block_id+blocks-1) hwm\n       FROM dba_extents\n       WHERE tablespace_name IN (SELECT tablespace_name FROM dba_tablespaces\n                                  WHERE CONTENTS='PERMANENT' AND STATUS='ONLINE')\n       GROUP BY file_id ) b\nWHERE a.file_id = b.file_id(+)\n  AND tablespace_name IN (SELECT tablespace_name FROM dba_tablespaces\n                           WHERE CONTENTS='PERMANENT' AND STATUS='ONLINE')\nORDER BY savings;"
                }
              ]
            },
            {
              "type": "tip",
              "text": "A coluna `savings` mostra o espaço que será liberado (em MB). Execute os comandos da coluna `smallest` um por um."
            }
          ]
        },
        {
          "id": "rebuild-indices-unusable",
          "title": "Rebuild de Índices UNUSABLE",
          "description": "Gera os comandos ALTER INDEX para recompilar todos os índices marcados como UNUSABLE no banco.",
          "tags": [
            "índice",
            "unusable",
            "rebuild",
            "performance"
          ],
          "sections": [
            {
              "type": "warning",
              "text": "Índices UNUSABLE impedem operações DML na tabela quando `skip_unusable_indexes = FALSE`. Priorize o rebuild em produção."
            },
            {
              "type": "steps",
              "title": "Passo a passo",
              "items": [
                {
                  "label": "Gerar os comandos de rebuild para todos os índices UNUSABLE",
                  "command": "SELECT 'ALTER INDEX ' || owner || '.' || index_name ||\n       ' REBUILD TABLESPACE ' || tablespace_name || ';' AS sql_to_rebuild\nFROM   dba_indexes\nWHERE  status = 'UNUSABLE'\nORDER BY owner, index_name;"
                }
              ]
            },
            {
              "type": "tip",
              "text": "Execute os comandos gerados um por um. Em tablespaces grandes, o rebuild pode demorar — considere executar fora do horário de pico."
            }
          ]
        },
        {
          "id": "objetos-invalidos",
          "title": "Objetos Inválidos",
          "description": "Lista e recompila objetos inválidos (procedures, functions, packages, views) no ambiente Oracle.",
          "tags": [
            "objetos inválidos",
            "invalid objects",
            "compilar",
            "utlrp",
            "recompile"
          ],
          "sections": [
            {
              "type": "info",
              "text": "A recompilação tenta revalidar os objetos automaticamente. Podem ocorrer erros de compilação se houver dependências quebradas."
            },
            {
              "type": "steps",
              "title": "Passo a passo",
              "items": [
                {
                  "label": "Listar total de objetos inválidos por owner e tipo",
                  "command": "COL owner FOR a40\nSET LINES 155\n\nSELECT\n  owner,\n  DECODE(object_type, NULL, '===========================> TOTAL', object_type) AS \"OBJECT_TYPE\",\n  COUNT(object_type) AS \"TOTAL\",\n  DECODE(GROUPING(owner), 0, NULL, 1, 'Total de objetos inválidos.') AS \" \"\nFROM dba_objects\nWHERE object_type != 'SYNONYM'\n  AND status != 'VALID'\n  --AND owner = '<OWNER>'\nGROUP BY ROLLUP (owner, object_type)\nORDER BY owner, object_type DESC;"
                },
                {
                  "label": "Gerar script de recompilação por owner",
                  "command": "SELECT 'ALTER ' || DECODE(object_type,\n         'PACKAGE BODY', 'PACKAGE \"' || owner || '\".\"' || object_name || '\" COMPILE BODY;',\n         object_type || ' \"' || owner || '\".\"' || object_name || '\" COMPILE;')\nFROM dba_objects\nWHERE owner LIKE '<OWNER>'\n  AND object_type != 'TABLE'\n  AND status != 'VALID';\n\n-- Ou recompilar tudo de uma vez com a package nativa do Oracle:\n@$ORACLE_HOME/rdbms/admin/utlrp.sql"
                }
              ]
            }
          ]
        },
        {
          "id": "rman-backup",
          "title": "Backup com RMAN",
          "description": "Realiza backup completo do banco de dados utilizando o RMAN com compressão e valida a integridade dos backups.",
          "tags": [
            "backup",
            "rman",
            "full backup",
            "recovery"
          ],
          "sections": [
            {
              "type": "info",
              "text": "Archivelog deve estar habilitado para backup online. Sem archivelog, o banco precisa estar fechado para backup consistente."
            },
            {
              "type": "steps",
              "title": "Passo a passo",
              "items": [
                {
                  "label": "Conectar ao RMAN",
                  "command": "rman target /"
                },
                {
                  "label": "Verificar backups existentes",
                  "command": "LIST BACKUP SUMMARY;"
                },
                {
                  "label": "Full backup do banco com compressão",
                  "command": "RUN {\n  ALLOCATE CHANNEL c1 DEVICE TYPE DISK FORMAT '/backup/rman/%d_%T_%s_%p.bkp';\n  BACKUP AS COMPRESSED BACKUPSET DATABASE INCLUDE CURRENT CONTROLFILE;\n  BACKUP ARCHIVELOG ALL DELETE INPUT;\n  RELEASE CHANNEL c1;\n}"
                },
                {
                  "label": "Validar backup (sem restaurar)",
                  "command": "RESTORE DATABASE VALIDATE;"
                }
              ]
            },
            {
              "type": "tip",
              "text": "Use `DELETE OBSOLETE;` para remover backups antigos conforme a política de retenção configurada."
            }
          ]
        },
        {
          "id": "datapump",
          "title": "Export e Import com Data Pump",
          "description": "Exporta e importa schemas ou tabelas utilizando o Data Pump (expdp/impdp), substituto moderno do exp/imp legado.",
          "tags": [
            "expdp",
            "impdp",
            "data pump",
            "export",
            "import"
          ],
          "sections": [
            {
              "type": "info",
              "text": "Data Pump é mais rápido que o exp/imp legado e requer um diretório Oracle criado no banco apontando para um caminho do sistema operacional."
            },
            {
              "type": "steps",
              "title": "Passo a passo",
              "items": [
                {
                  "label": "Criar o diretório Oracle apontando para o SO",
                  "command": "CREATE OR REPLACE DIRECTORY dir_dp AS '/backup/datapump';\nGRANT READ, WRITE ON DIRECTORY dir_dp TO <USUARIO>;"
                },
                {
                  "label": "Export de um schema completo",
                  "command": "expdp <USUARIO>/<SENHA> DIRECTORY=dir_dp DUMPFILE=schema_%date%.dmp LOGFILE=exp_schema.log SCHEMAS=<SCHEMA>"
                },
                {
                  "label": "Export de tabelas específicas",
                  "command": "expdp <USUARIO>/<SENHA> DIRECTORY=dir_dp DUMPFILE=tabelas.dmp LOGFILE=exp_tabelas.log TABLES=<SCHEMA>.<TABELA1>,<SCHEMA>.<TABELA2>"
                },
                {
                  "label": "Import de schema",
                  "command": "impdp <USUARIO>/<SENHA> DIRECTORY=dir_dp DUMPFILE=schema_%date%.dmp LOGFILE=imp_schema.log SCHEMAS=<SCHEMA>"
                }
              ]
            },
            {
              "type": "tip",
              "text": "Use `REMAP_SCHEMA=origem:destino` no impdp para importar para um schema diferente do original."
            }
          ]
        },
        {
          "id": "usuarios-permissoes-oracle",
          "title": "Gerenciar Usuários e Permissões",
          "description": "Cria usuários, concede e revoga permissões de sistema e de objetos, e controla o acesso no Oracle.",
          "tags": [
            "usuário",
            "grant",
            "revoke",
            "role",
            "permissão",
            "create user"
          ],
          "sections": [
            {
              "type": "steps",
              "title": "Passo a passo",
              "items": [
                {
                  "label": "Criar usuário",
                  "command": "CREATE USER <USUARIO> IDENTIFIED BY <SENHA>\n  DEFAULT TABLESPACE users\n  TEMPORARY TABLESPACE temp\n  QUOTA UNLIMITED ON users;"
                },
                {
                  "label": "Conceder permissões básicas (conectar e criar objetos)",
                  "command": "GRANT CREATE SESSION, CREATE TABLE, CREATE VIEW,\n      CREATE PROCEDURE, CREATE SEQUENCE TO <USUARIO>;"
                },
                {
                  "label": "Conceder permissão em objeto específico",
                  "command": "GRANT SELECT, INSERT, UPDATE, DELETE ON <SCHEMA>.<TABELA> TO <USUARIO>;"
                },
                {
                  "label": "Ver todas as permissões de um usuário",
                  "command": "-- System privileges\nSELECT privilege FROM dba_sys_privs WHERE grantee = '<USUARIO>'\nUNION\n-- Object privileges\nSELECT privilege || ' ON ' || owner || '.' || table_name\nFROM dba_tab_privs WHERE grantee = '<USUARIO>'\nORDER BY 1;"
                },
                {
                  "label": "Bloquear e desbloquear usuário",
                  "command": "-- Bloquear\nALTER USER <USUARIO> ACCOUNT LOCK;\n\n-- Desbloquear\nALTER USER <USUARIO> ACCOUNT UNLOCK;"
                }
              ]
            },
            {
              "type": "tip",
              "text": "Use `GRANT <ROLE> TO <USUARIO>` para conceder roles pré-definidas como DBA, CONNECT ou RESOURCE."
            }
          ]
        },
        {
          "id": "top-sql",
          "title": "Top SQL — Queries Mais Pesadas",
          "description": "Identifica as queries que mais consomem CPU e tempo de execução a partir da V$SQL (shared pool).",
          "tags": [
            "performance",
            "tuning",
            "sql_id",
            "cpu",
            "elapsed time",
            "v$sql"
          ],
          "sections": [
            {
              "type": "info",
              "text": "A view V$SQL mantém as queries em memória (shared pool). Queries purgadas da memória não aparecem aqui — para histórico, use AWR (V$SQLAREA/DBA_HIST_SQLSTAT)."
            },
            {
              "type": "steps",
              "title": "Passo a passo",
              "items": [
                {
                  "label": "Top 10 queries por elapsed time",
                  "command": "SELECT sql_id,\n       ROUND(elapsed_time/1e6/executions, 2) AS avg_elapsed_sec,\n       ROUND(cpu_time/1e6/executions, 2)     AS avg_cpu_sec,\n       executions,\n       SUBSTR(sql_text, 1, 80)               AS sql_text\nFROM v$sql\nWHERE executions > 0\nORDER BY avg_elapsed_sec DESC\nFETCH FIRST 10 ROWS ONLY;"
                },
                {
                  "label": "Top 10 queries por consumo de CPU",
                  "command": "SELECT sql_id,\n       ROUND(cpu_time/1e6, 2)     AS total_cpu_sec,\n       ROUND(elapsed_time/1e6, 2) AS total_elapsed_sec,\n       executions,\n       SUBSTR(sql_text, 1, 80)    AS sql_text\nFROM v$sql\nWHERE executions > 0\nORDER BY total_cpu_sec DESC\nFETCH FIRST 10 ROWS ONLY;"
                },
                {
                  "label": "Ver plano de execução de um SQL_ID",
                  "command": "SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY_CURSOR('&sql_id', NULL, 'ALLSTATS LAST'));"
                }
              ]
            },
            {
              "type": "tip",
              "text": "Use o `sql_id` do resultado para buscar detalhes em V$SQL_PLAN ou para analisar com o SQL Tuning Advisor."
            }
          ]
        },
        {
          "id": "alert-log",
          "title": "Verificar Alert Log",
          "description": "Localiza e consulta o alert log do Oracle para identificar erros críticos e eventos de startup/shutdown.",
          "tags": [
            "alert log",
            "erros",
            "diagnóstico",
            "adr",
            "ora-"
          ],
          "sections": [
            {
              "type": "info",
              "text": "O alert log registra startups, shutdowns, erros críticos e mensagens do Oracle. É o primeiro lugar a checar diante de qualquer problema."
            },
            {
              "type": "steps",
              "title": "Passo a passo",
              "items": [
                {
                  "label": "Encontrar o caminho do alert log",
                  "command": "SELECT value FROM v$diag_info WHERE name = 'Diag Trace';\n-- O arquivo se chama alert_<INSTANCIA>.log dentro dessa pasta"
                },
                {
                  "label": "Ver o caminho do ADR Home",
                  "command": "SELECT value FROM v$diag_info WHERE name = 'ADR Home';"
                },
                {
                  "label": "Ver os últimos erros ORA- pelo banco de dados",
                  "command": "SELECT originating_timestamp, message_text\nFROM v$diag_alert_ext\nWHERE message_text LIKE '%ORA-%'\n  AND originating_timestamp >= SYSDATE - 1\nORDER BY originating_timestamp DESC\nFETCH FIRST 50 ROWS ONLY;"
                },
                {
                  "label": "No sistema operacional, acompanhar em tempo real",
                  "command": "tail -f $ORACLE_BASE/diag/rdbms/<DB>/<INSTANCE>/trace/alert_<INSTANCE>.log"
                }
              ]
            },
            {
              "type": "tip",
              "text": "Filtre por `ORA-600`, `ORA-7445` e `ORA-4031` — esses são os erros mais críticos do Oracle que sempre merecem atenção imediata."
            }
          ]
        }
      ]
    },
    {
      "id": "sqlserver",
      "name": "SQL Server",
      "color": "#2732cc",
      "topics": [
        {
          "id": "locks-sqlserver",
          "title": "Verificar e Matar Locks",
          "tags": [
            "lock",
            "bloqueio",
            "sessão",
            "kill"
          ],
          "description": "Identifica sessões bloqueadas e encerra processos travados no SQL Server.",
          "sections": [
            {
              "type": "steps",
              "title": "Identificar locks",
              "items": [
                {
                  "label": "Liste sessões bloqueadas",
                  "command": "SELECT\n  r.session_id AS sessao_bloqueada,\n  r.blocking_session_id AS bloqueador,\n  r.wait_type,\n  r.wait_time / 1000 AS espera_seg,\n  t.text AS sql_executado\nFROM sys.dm_exec_requests r\nCROSS APPLY sys.dm_exec_sql_text(r.sql_handle) t\nWHERE r.blocking_session_id > 0;"
                },
                {
                  "label": "Detalhes da sessão bloqueadora",
                  "command": "SELECT\n  session_id,\n  login_name,\n  host_name,\n  program_name,\n  status,\n  last_request_start_time\nFROM sys.dm_exec_sessions\nWHERE session_id = <BLOQUEADOR_ID>;"
                },
                {
                  "label": "Encerre a sessão bloqueadora",
                  "command": "KILL <SESSION_ID>;"
                }
              ]
            },
            {
              "type": "tip",
              "text": "Use sp_who2 para uma visão rápida de todas as sessões ativas e seus bloqueios."
            }
          ]
        },
        {
          "id": "backup-restore",
          "title": "Backup e Restore",
          "tags": [
            "backup",
            "restore",
            "recovery"
          ],
          "description": "Comandos essenciais de backup completo, diferencial e de log, e como restaurar.",
          "sections": [
            {
              "type": "steps",
              "title": "Backup",
              "items": [
                {
                  "label": "Backup completo (FULL)",
                  "command": "BACKUP DATABASE [NomeBanco]\nTO DISK = 'C:\\Backup\\NomeBanco_FULL.bak'\nWITH COMPRESSION, CHECKSUM, STATS = 10;"
                },
                {
                  "label": "Backup diferencial",
                  "command": "BACKUP DATABASE [NomeBanco]\nTO DISK = 'C:\\Backup\\NomeBanco_DIFF.bak'\nWITH DIFFERENTIAL, COMPRESSION, STATS = 10;"
                },
                {
                  "label": "Backup de log de transações",
                  "command": "BACKUP LOG [NomeBanco]\nTO DISK = 'C:\\Backup\\NomeBanco_LOG.bak'\nWITH COMPRESSION, STATS = 10;"
                }
              ]
            },
            {
              "type": "steps",
              "title": "Restore",
              "items": [
                {
                  "label": "Restaure o FULL (com NORECOVERY se houver DIFF/LOG depois)",
                  "command": "RESTORE DATABASE [NomeBanco]\nFROM DISK = 'C:\\Backup\\NomeBanco_FULL.bak'\nWITH NORECOVERY, STATS = 10;"
                },
                {
                  "label": "Aplique o diferencial",
                  "command": "RESTORE DATABASE [NomeBanco]\nFROM DISK = 'C:\\Backup\\NomeBanco_DIFF.bak'\nWITH NORECOVERY, STATS = 10;"
                },
                {
                  "label": "Aplique o log e finalize",
                  "command": "RESTORE LOG [NomeBanco]\nFROM DISK = 'C:\\Backup\\NomeBanco_LOG.bak'\nWITH RECOVERY;"
                }
              ]
            }
          ]
        },
        {
          "id": "espaco-databases-sqlserver",
          "title": "Verificar Espaço das Databases",
          "description": "Consulta o tamanho total, espaço usado e espaço livre de todas as databases e seus arquivos no SQL Server.",
          "tags": [
            "espaço",
            "disco",
            "database",
            "tamanho",
            "datafile"
          ],
          "sections": [
            {
              "type": "steps",
              "title": "Passo a passo",
              "items": [
                {
                  "label": "Tamanho e espaço livre de todas as databases",
                  "command": "SELECT\n  db.name AS database_name,\n  ROUND(SUM(mf.size) * 8.0 / 1024, 2) AS total_mb,\n  ROUND(SUM(mf.size) * 8.0 / 1024 -\n        SUM(FILEPROPERTY(mf.name, 'SpaceUsed') * 8.0 / 1024), 2) AS free_mb,\n  ROUND((SUM(FILEPROPERTY(mf.name, 'SpaceUsed') * 8.0 / 1024) /\n         NULLIF(SUM(mf.size) * 8.0 / 1024, 0)) * 100, 2) AS used_pct\nFROM sys.databases db\nJOIN sys.master_files mf ON db.database_id = mf.database_id\nWHERE mf.type = 0  -- apenas datafiles\nGROUP BY db.name\nORDER BY total_mb DESC;"
                },
                {
                  "label": "Detalhes dos arquivos de uma database específica",
                  "command": "USE [<NomeBanco>];\n\nSELECT\n  name,\n  physical_name,\n  ROUND(size * 8.0 / 1024, 2) AS size_mb,\n  ROUND(FILEPROPERTY(name, 'SpaceUsed') * 8.0 / 1024, 2) AS used_mb,\n  is_percent_growth,\n  growth,\n  ROUND(max_size * 8.0 / 1024, 2) AS max_size_mb\nFROM sys.database_files;"
                },
                {
                  "label": "Espaço usado e livre pela stored procedure nativa",
                  "command": "USE [<NomeBanco>];\nEXEC sp_spaceused;"
                }
              ]
            }
          ]
        },
        {
          "id": "logins-usuarios-sqlserver",
          "title": "Gerenciar Logins e Usuários",
          "description": "Cria logins e usuários no SQL Server, associa a roles e controla o acesso às databases.",
          "tags": [
            "login",
            "usuário",
            "permissão",
            "role",
            "grant",
            "create login"
          ],
          "sections": [
            {
              "type": "steps",
              "title": "Passo a passo",
              "items": [
                {
                  "label": "Criar login SQL Server (autenticação SQL)",
                  "command": "CREATE LOGIN <login_name>\n  WITH PASSWORD = '<senha_forte>',\n       CHECK_POLICY = ON,\n       CHECK_EXPIRATION = OFF;"
                },
                {
                  "label": "Criar usuário no banco de dados e associar ao login",
                  "command": "USE [<NomeBanco>];\nCREATE USER <user_name> FOR LOGIN <login_name>;"
                },
                {
                  "label": "Adicionar a uma role de banco de dados",
                  "command": "USE [<NomeBanco>];\n-- Opções: db_owner, db_datareader, db_datawriter, db_ddladmin\nALTER ROLE db_datareader ADD MEMBER <user_name>;\nALTER ROLE db_datawriter ADD MEMBER <user_name>;"
                },
                {
                  "label": "Ver permissões de um usuário",
                  "command": "SELECT dp.name AS principal, dp.type_desc, p.permission_name, p.state_desc\nFROM sys.database_permissions p\nJOIN sys.database_principals dp ON p.grantee_principal_id = dp.principal_id\nWHERE dp.name = '<user_name>'\nORDER BY p.permission_name;"
                },
                {
                  "label": "Desabilitar e habilitar um login",
                  "command": "-- Desabilitar\nALTER LOGIN <login_name> DISABLE;\n\n-- Habilitar\nALTER LOGIN <login_name> ENABLE;"
                }
              ]
            },
            {
              "type": "tip",
              "text": "Use `IS_SRVROLEMEMBER('sysadmin', '<login_name>')` para verificar se um login tem privilégio de sysadmin."
            }
          ]
        },
        {
          "id": "top-queries-sqlserver",
          "title": "Queries Mais Pesadas",
          "description": "Identifica as queries que mais consomem CPU e tempo de execução usando as DMVs dm_exec_query_stats e dm_exec_sql_text.",
          "tags": [
            "performance",
            "tuning",
            "query stats",
            "dm_exec",
            "cpu",
            "elapsed time"
          ],
          "sections": [
            {
              "type": "info",
              "text": "As views de gerenciamento dinâmico `dm_exec_*` mantêm estatísticas desde o último restart do SQL Server ou da entrada do plano no cache."
            },
            {
              "type": "steps",
              "title": "Passo a passo",
              "items": [
                {
                  "label": "Top 10 queries por CPU total consumido",
                  "command": "SELECT TOP 10\n  qs.total_worker_time / qs.execution_count AS avg_cpu_us,\n  qs.total_worker_time                       AS total_cpu_us,\n  qs.execution_count,\n  qs.total_elapsed_time / qs.execution_count AS avg_elapsed_us,\n  SUBSTRING(qt.text, (qs.statement_start_offset/2)+1,\n            ((CASE qs.statement_end_offset WHEN -1 THEN DATALENGTH(qt.text)\n              ELSE qs.statement_end_offset END - qs.statement_start_offset)/2)+1) AS query_text\nFROM sys.dm_exec_query_stats qs\nCROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) qt\nORDER BY total_cpu_us DESC;"
                },
                {
                  "label": "Top 10 queries por tempo de execução médio",
                  "command": "SELECT TOP 10\n  qs.total_elapsed_time / qs.execution_count AS avg_elapsed_us,\n  qs.execution_count,\n  qs.total_worker_time / qs.execution_count  AS avg_cpu_us,\n  SUBSTRING(qt.text, (qs.statement_start_offset/2)+1,\n            ((CASE qs.statement_end_offset WHEN -1 THEN DATALENGTH(qt.text)\n              ELSE qs.statement_end_offset END - qs.statement_start_offset)/2)+1) AS query_text\nFROM sys.dm_exec_query_stats qs\nCROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) qt\nORDER BY avg_elapsed_us DESC;"
                },
                {
                  "label": "Ver plano de execução de uma query em cache",
                  "command": "SELECT qp.query_plan\nFROM sys.dm_exec_query_stats qs\nCROSS APPLY sys.dm_exec_query_plan(qs.plan_handle) qp\nCROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) qt\nWHERE qt.text LIKE '%<trecho_da_query>%';"
                }
              ]
            }
          ]
        },
        {
          "id": "fragmentacao-indices-sqlserver",
          "title": "Fragmentação e Rebuild de Índices",
          "description": "Verifica o percentual de fragmentação dos índices e executa REBUILD ou REORGANIZE conforme o nível encontrado.",
          "tags": [
            "índice",
            "fragmentação",
            "rebuild",
            "reorganize",
            "performance"
          ],
          "sections": [
            {
              "type": "info",
              "text": "Fragmentação > 30%: use REBUILD. Entre 5% e 30%: use REORGANIZE. Abaixo de 5%: não precisa de intervenção."
            },
            {
              "type": "steps",
              "title": "Passo a passo",
              "items": [
                {
                  "label": "Verificar fragmentação dos índices de uma database",
                  "command": "USE [<NomeBanco>];\n\nSELECT\n  OBJECT_NAME(ips.object_id)  AS tabela,\n  i.name                       AS indice,\n  ips.index_type_desc,\n  ROUND(ips.avg_fragmentation_in_percent, 2) AS fragmentacao_pct,\n  ips.page_count               AS paginas\nFROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'LIMITED') ips\nJOIN sys.indexes i ON ips.object_id = i.object_id AND ips.index_id = i.index_id\nWHERE ips.avg_fragmentation_in_percent > 5\n  AND ips.page_count > 100\nORDER BY fragmentacao_pct DESC;"
                },
                {
                  "label": "Rebuild de um índice específico (offline, recria completamente)",
                  "command": "ALTER INDEX [<NomeIndice>] ON [<Tabela>] REBUILD WITH (ONLINE = ON);"
                },
                {
                  "label": "Reorganize de um índice (online, menos recursos)",
                  "command": "ALTER INDEX [<NomeIndice>] ON [<Tabela>] REORGANIZE;"
                },
                {
                  "label": "Rebuild de todos os índices de uma tabela",
                  "command": "ALTER INDEX ALL ON [<Tabela>] REBUILD WITH (ONLINE = ON);"
                }
              ]
            },
            {
              "type": "tip",
              "text": "`ONLINE = ON` permite manter a tabela acessível durante o rebuild, mas requer SQL Server Enterprise ou Developer Edition."
            }
          ]
        },
        {
          "id": "jobs-sql-agent",
          "title": "Verificar Jobs do SQL Agent",
          "description": "Lista todos os jobs do SQL Agent com status da última execução e identifica jobs que falharam recentemente.",
          "tags": [
            "sql agent",
            "job",
            "agendamento",
            "schedule",
            "histórico"
          ],
          "sections": [
            {
              "type": "steps",
              "title": "Passo a passo",
              "items": [
                {
                  "label": "Listar todos os jobs com status da última execução",
                  "command": "SELECT\n  j.name                     AS job_name,\n  j.enabled,\n  CASE jh.run_status\n    WHEN 0 THEN 'Falhou'\n    WHEN 1 THEN 'Sucesso'\n    WHEN 2 THEN 'Retry'\n    WHEN 3 THEN 'Cancelado'\n    WHEN 4 THEN 'Em execução'\n  END                        AS ultimo_status,\n  msdb.dbo.agent_datetime(jh.run_date, jh.run_time) AS ultima_execucao,\n  jh.message\nFROM msdb.dbo.sysjobs j\nLEFT JOIN msdb.dbo.sysjobhistory jh\n  ON j.job_id = jh.job_id AND jh.step_id = 0\nWHERE jh.instance_id = (\n  SELECT MAX(instance_id) FROM msdb.dbo.sysjobhistory\n  WHERE job_id = j.job_id AND step_id = 0\n) OR jh.instance_id IS NULL\nORDER BY ultima_execucao DESC;"
                },
                {
                  "label": "Jobs que falharam nas últimas 24 horas",
                  "command": "SELECT\n  j.name AS job_name,\n  msdb.dbo.agent_datetime(jh.run_date, jh.run_time) AS data_falha,\n  jh.step_name,\n  jh.message\nFROM msdb.dbo.sysjobhistory jh\nJOIN msdb.dbo.sysjobs j ON jh.job_id = j.job_id\nWHERE jh.run_status = 0\n  AND msdb.dbo.agent_datetime(jh.run_date, jh.run_time) >= DATEADD(HOUR, -24, GETDATE())\nORDER BY data_falha DESC;"
                }
              ]
            },
            {
              "type": "tip",
              "text": "Use `EXEC msdb.dbo.sp_start_job N'<NomeJob>'` para disparar um job manualmente via T-SQL."
            }
          ]
        }
      ]
    },
    {
      "id": "postgresql",
      "name": "PostgreSQL",
      "color": "#10ad45",
      "topics": [
        {
          "id": "locks-postgres",
          "title": "Verificar e Matar Locks",
          "tags": [
            "lock",
            "bloqueio",
            "pg_locks",
            "terminate"
          ],
          "description": "Identifica sessões com locks e encerra processos bloqueados no PostgreSQL.",
          "sections": [
            {
              "type": "steps",
              "title": "Identificar locks",
              "items": [
                {
                  "label": "Liste todas as sessões bloqueadas",
                  "command": "SELECT\n  blocked.pid AS pid_bloqueado,\n  blocked.usename AS usuario,\n  blocked.query AS query_bloqueada,\n  blocking.pid AS pid_bloqueador,\n  blocking.query AS query_bloqueadora\nFROM pg_stat_activity blocked\nJOIN pg_stat_activity blocking\n  ON blocking.pid = ANY(pg_blocking_pids(blocked.pid))\nWHERE cardinality(pg_blocking_pids(blocked.pid)) > 0;"
                },
                {
                  "label": "Cancele apenas a query (mantém a conexão)",
                  "command": "SELECT pg_cancel_backend(<PID>);"
                },
                {
                  "label": "Encerre a sessão inteira",
                  "command": "SELECT pg_terminate_backend(<PID>);"
                }
              ]
            },
            {
              "type": "tip",
              "text": "Use pg_cancel_backend quando quiser apenas interromper a query sem derrubar a conexão do usuário."
            }
          ]
        },
        {
          "id": "vacuum-analyze",
          "title": "VACUUM e ANALYZE",
          "tags": [
            "vacuum",
            "analyze",
            "bloat",
            "performance"
          ],
          "description": "Recupera espaço e atualiza estatísticas para o planner de queries.",
          "sections": [
            {
              "type": "info",
              "text": "O autovacuum cuida disso automaticamente, mas em tabelas muito movimentadas pode ser necessário executar manualmente."
            },
            {
              "type": "steps",
              "title": "Comandos",
              "items": [
                {
                  "label": "VACUUM simples (libera espaço para reuso interno)",
                  "command": "VACUUM NomeDaTabela;"
                },
                {
                  "label": "VACUUM FULL (compacta o arquivo físico — tabela fica locked)",
                  "command": "VACUUM FULL NomeDaTabela;"
                },
                {
                  "label": "ANALYZE (atualiza estatísticas para o planner)",
                  "command": "ANALYZE NomeDaTabela;"
                },
                {
                  "label": "Os dois juntos",
                  "command": "VACUUM ANALYZE NomeDaTabela;"
                },
                {
                  "label": "Verifique tabelas com mais dead tuples",
                  "command": "SELECT\n  schemaname,\n  relname AS tabela,\n  n_dead_tup AS dead_tuples,\n  n_live_tup AS live_tuples,\n  last_autovacuum\nFROM pg_stat_user_tables\nORDER BY n_dead_tup DESC\nLIMIT 20;"
                }
              ]
            }
          ]
        },
        {
          "id": "backup-restore-postgres",
          "title": "Backup e Restore com pg_dump",
          "description": "Realiza backup e restore de databases PostgreSQL usando pg_dump, pg_restore e pg_dumpall.",
          "tags": [
            "backup",
            "restore",
            "pg_dump",
            "pg_restore",
            "pg_dumpall"
          ],
          "sections": [
            {
              "type": "warning",
              "text": "O pg_dump faz backup de uma database por vez. Para backup completo do cluster (todos os bancos + roles + configurações) use pg_dumpall."
            },
            {
              "type": "steps",
              "title": "Passo a passo",
              "items": [
                {
                  "label": "Backup de uma database (formato custom — recomendado)",
                  "command": "pg_dump -U postgres -Fc -f /backup/<banco>.dump <banco>"
                },
                {
                  "label": "Backup em formato SQL puro (legível, mas maior)",
                  "command": "pg_dump -U postgres -f /backup/<banco>.sql <banco>"
                },
                {
                  "label": "Backup de um schema específico",
                  "command": "pg_dump -U postgres -Fc -n <schema> -f /backup/<schema>.dump <banco>"
                },
                {
                  "label": "Restore a partir do formato custom",
                  "command": "pg_restore -U postgres -d <banco_destino> -v /backup/<banco>.dump"
                },
                {
                  "label": "Backup completo do cluster (todos os bancos + roles + configs)",
                  "command": "pg_dumpall -U postgres -f /backup/cluster_full.sql"
                }
              ]
            },
            {
              "type": "tip",
              "text": "Use `-j 4` no pg_restore para restaurar em paralelo e acelerar o processo em databases grandes."
            }
          ]
        },
        {
          "id": "roles-usuarios-postgres",
          "title": "Gerenciar Roles e Usuários",
          "description": "Cria usuários e roles no PostgreSQL, concede permissões em databases, schemas e tabelas.",
          "tags": [
            "role",
            "usuário",
            "permissão",
            "grant",
            "create user",
            "create role"
          ],
          "sections": [
            {
              "type": "info",
              "text": "No PostgreSQL, usuários e roles são a mesma coisa — a diferença é que usuários têm LOGIN por padrão."
            },
            {
              "type": "steps",
              "title": "Passo a passo",
              "items": [
                {
                  "label": "Criar usuário com senha",
                  "command": "CREATE USER <usuario> WITH PASSWORD '<senha>' CONNECTION LIMIT 10;"
                },
                {
                  "label": "Conceder acesso a uma database",
                  "command": "GRANT CONNECT ON DATABASE <banco> TO <usuario>;\nGRANT USAGE ON SCHEMA public TO <usuario>;"
                },
                {
                  "label": "Conceder permissões em tabelas",
                  "command": "-- Tabelas existentes\nGRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO <usuario>;\n\n-- Tabelas criadas no futuro\nALTER DEFAULT PRIVILEGES IN SCHEMA public\n  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO <usuario>;"
                },
                {
                  "label": "Ver roles e permissões no banco",
                  "command": "-- Roles existentes\nSELECT rolname, rolsuper, rolcreatedb, rolcanlogin FROM pg_roles ORDER BY rolname;\n\n-- Permissões de um usuário nas tabelas\nSELECT table_name, privilege_type\nFROM information_schema.role_table_grants\nWHERE grantee = '<usuario>'\nORDER BY table_name;"
                },
                {
                  "label": "Remover usuário",
                  "command": "-- Revogar permissões primeiro\nREVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM <usuario>;\nDROP USER <usuario>;"
                }
              ]
            }
          ]
        },
        {
          "id": "tamanho-databases-postgres",
          "title": "Tamanho de Databases e Tabelas",
          "description": "Consulta o tamanho de databases, tabelas e índices no PostgreSQL usando funções nativas do sistema.",
          "tags": [
            "tamanho",
            "espaço",
            "disco",
            "pg_database_size",
            "pg_total_relation_size"
          ],
          "sections": [
            {
              "type": "steps",
              "title": "Passo a passo",
              "items": [
                {
                  "label": "Tamanho de todas as databases do cluster",
                  "command": "SELECT datname AS database,\n       pg_size_pretty(pg_database_size(datname)) AS tamanho\nFROM pg_database\nORDER BY pg_database_size(datname) DESC;"
                },
                {
                  "label": "Top 20 maiores tabelas (dados + índices)",
                  "command": "SELECT\n  schemaname || '.' || tablename AS tabela,\n  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total,\n  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename))       AS dados,\n  pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename))        AS indices\nFROM pg_tables\nWHERE schemaname NOT IN ('pg_catalog', 'information_schema')\nORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC\nLIMIT 20;"
                },
                {
                  "label": "Tamanho de um schema específico",
                  "command": "SELECT pg_size_pretty(\n  SUM(pg_total_relation_size(schemaname||'.'||tablename))\n) AS total_schema\nFROM pg_tables\nWHERE schemaname = '<schema>';"
                }
              ]
            }
          ]
        },
        {
          "id": "conexoes-ativas-postgres",
          "title": "Conexões Ativas",
          "description": "Monitora conexões ativas e ociosas por database e identifica queries em execução há muito tempo no PostgreSQL.",
          "tags": [
            "conexão",
            "sessão",
            "pg_stat_activity",
            "monitoramento",
            "idle"
          ],
          "sections": [
            {
              "type": "steps",
              "title": "Passo a passo",
              "items": [
                {
                  "label": "Ver todas as conexões ativas por database",
                  "command": "SELECT datname AS database,\n       COUNT(*) AS conexoes,\n       COUNT(*) FILTER (WHERE state = 'active')  AS ativas,\n       COUNT(*) FILTER (WHERE state = 'idle')    AS ociosas\nFROM pg_stat_activity\nWHERE pid <> pg_backend_pid()\nGROUP BY datname\nORDER BY conexoes DESC;"
                },
                {
                  "label": "Detalhe das conexões em execução",
                  "command": "SELECT pid, usename, application_name, client_addr, state,\n       NOW() - query_start AS tempo_execucao,\n       LEFT(query, 80) AS query\nFROM pg_stat_activity\nWHERE state = 'active'\n  AND pid <> pg_backend_pid()\nORDER BY tempo_execucao DESC NULLS LAST;"
                },
                {
                  "label": "Queries rodando há mais de 5 minutos",
                  "command": "SELECT pid, usename, state,\n       NOW() - query_start AS tempo_execucao,\n       query\nFROM pg_stat_activity\nWHERE state = 'active'\n  AND NOW() - query_start > INTERVAL '5 minutes'\n  AND pid <> pg_backend_pid()\nORDER BY tempo_execucao DESC;"
                }
              ]
            },
            {
              "type": "tip",
              "text": "Use `SELECT pg_terminate_backend(pid)` para encerrar uma conexão específica pelo PID listado acima."
            }
          ]
        },
        {
          "id": "custom-1777467170370",
          "title": "Max Connections",
          "description": "Consultas para avaliar o máximo de conexões  no postgres",
          "tags": [
            "max_connections",
            "connections",
            "conexões"
          ],
          "sections": [
            {
              "type": "steps",
              "title": "Passo a passo",
              "items": [
                {
                  "label": "Conexões ativas e máximo de conexões",
                  "command": "SELECT\n    current_connections,\n    max_connections,\n    ROUND((current_connections::numeric / max_connections) * 100, 2) AS utilization_pct\nFROM (\n    SELECT\n        (SELECT COUNT(*) FROM pg_stat_activity) AS current_connections,\n        (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') AS max_connections\n) t;"
                },
                {
                  "label": "Conexões detalhadas",
                  "command": "SELECT\n    total_connections,\n    active_connections,\n    max_connections,\n    ROUND((total_connections::numeric / max_connections) * 100, 2) AS total_utilization_pct,\n    ROUND((active_connections::numeric / max_connections) * 100, 2) AS active_utilization_pct\nFROM (\n    SELECT\n        (SELECT COUNT(*) FROM pg_stat_activity) AS total_connections,\n        (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active') AS active_connections,\n        (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') AS max_connections\n) t;"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "mysql",
      "name": "MySQL",
      "color": "#F29111",
      "topics": [
        {
          "id": "locks-mysql",
          "title": "Verificar e Matar Locks",
          "tags": [
            "lock",
            "bloqueio",
            "innodb",
            "kill",
            "processlist"
          ],
          "description": "Identifica transações bloqueadas e encerra processos travados no MySQL/InnoDB.",
          "sections": [
            {
              "type": "steps",
              "title": "Identificar locks",
              "items": [
                {
                  "label": "Visão rápida de todos os processos ativos",
                  "command": "SHOW PROCESSLIST;"
                },
                {
                  "label": "Detalhe de bloqueios entre transações (InnoDB)",
                  "command": "SELECT\n  r.trx_id AS trx_bloqueada,\n  r.trx_mysql_thread_id AS thread_bloqueado,\n  r.trx_query AS query_bloqueada,\n  b.trx_id AS trx_bloqueadora,\n  b.trx_mysql_thread_id AS thread_bloqueador,\n  b.trx_query AS query_bloqueadora\nFROM information_schema.innodb_lock_waits w\nJOIN information_schema.innodb_trx r ON r.trx_id = w.requesting_trx_id\nJOIN information_schema.innodb_trx b ON b.trx_id = w.blocking_trx_id;"
                },
                {
                  "label": "Encerre o processo bloqueador (substitua o ID)",
                  "command": "KILL <thread_id>;"
                }
              ]
            },
            {
              "type": "tip",
              "text": "No MySQL 8+, use performance_schema.data_lock_waits no lugar de information_schema.innodb_lock_waits."
            }
          ]
        },
        {
          "id": "backup-mysql",
          "title": "Backup e Restore com mysqldump",
          "tags": [
            "backup",
            "restore",
            "mysqldump",
            "recovery"
          ],
          "description": "Gera e restaura backups lógicos com o mysqldump, ferramenta padrão do MySQL.",
          "sections": [
            {
              "type": "warning",
              "text": "O mysqldump bloqueia as tabelas durante o dump em tabelas MyISAM. Use --single-transaction para InnoDB sem bloqueio."
            },
            {
              "type": "steps",
              "title": "Backup",
              "items": [
                {
                  "label": "Backup de um banco específico",
                  "command": "mysqldump -u root -p --single-transaction nome_banco > backup_banco.sql"
                },
                {
                  "label": "Backup de todos os bancos",
                  "command": "mysqldump -u root -p --all-databases --single-transaction > backup_full.sql"
                },
                {
                  "label": "Backup comprimido (economiza espaço)",
                  "command": "mysqldump -u root -p --single-transaction nome_banco | gzip > backup_banco.sql.gz"
                }
              ]
            },
            {
              "type": "steps",
              "title": "Restore",
              "items": [
                {
                  "label": "Restaure um banco a partir do .sql",
                  "command": "mysql -u root -p nome_banco < backup_banco.sql"
                },
                {
                  "label": "Restaure a partir de arquivo comprimido",
                  "command": "gunzip < backup_banco.sql.gz | mysql -u root -p nome_banco"
                }
              ]
            }
          ]
        },
        {
          "id": "tamanho-databases-mysql",
          "title": "Verificar Tamanho das Databases",
          "tags": [
            "tamanho",
            "espaço",
            "disco",
            "information_schema"
          ],
          "description": "Consulta o espaço utilizado por databases e tabelas direto do catálogo do MySQL.",
          "sections": [
            {
              "type": "steps",
              "title": "Queries úteis",
              "items": [
                {
                  "label": "Tamanho de todas as databases",
                  "command": "SELECT\n  table_schema AS database_name,\n  ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS total_mb\nFROM information_schema.tables\nGROUP BY table_schema\nORDER BY total_mb DESC;"
                },
                {
                  "label": "Tamanho por tabela dentro de um banco",
                  "command": "SELECT\n  table_name AS tabela,\n  ROUND((data_length + index_length) / 1024 / 1024, 2) AS total_mb,\n  ROUND(data_length / 1024 / 1024, 2) AS dados_mb,\n  ROUND(index_length / 1024 / 1024, 2) AS indices_mb\nFROM information_schema.tables\nWHERE table_schema = 'nome_banco'\nORDER BY total_mb DESC;"
                }
              ]
            }
          ]
        },
        {
          "id": "usuarios-privilegios-mysql",
          "title": "Gerenciar Usuários e Privilégios",
          "tags": [
            "usuário",
            "grant",
            "privilégio",
            "permissão",
            "create user"
          ],
          "description": "Cria usuários, concede e revoga permissões no MySQL.",
          "sections": [
            {
              "type": "steps",
              "title": "Usuários",
              "items": [
                {
                  "label": "Crie um novo usuário",
                  "command": "CREATE USER 'nome_usuario'@'%' IDENTIFIED BY 'senha_forte';"
                },
                {
                  "label": "Conceda todas as permissões em um banco",
                  "command": "GRANT ALL PRIVILEGES ON nome_banco.* TO 'nome_usuario'@'%';"
                },
                {
                  "label": "Conceda apenas leitura",
                  "command": "GRANT SELECT ON nome_banco.* TO 'nome_usuario'@'%';"
                },
                {
                  "label": "Aplique as permissões",
                  "command": "FLUSH PRIVILEGES;"
                },
                {
                  "label": "Veja as permissões de um usuário",
                  "command": "SHOW GRANTS FOR 'nome_usuario'@'%';"
                },
                {
                  "label": "Revogue todas as permissões",
                  "command": "REVOKE ALL PRIVILEGES ON nome_banco.* FROM 'nome_usuario'@'%';"
                }
              ]
            }
          ]
        },
        {
          "id": "conexoes-processlist-mysql",
          "title": "Conexões e Processlist",
          "description": "Monitora conexões ativas, identifica queries lentas e verifica o limite de conexões do MySQL.",
          "tags": [
            "sessão",
            "processlist",
            "conexão",
            "monitoramento",
            "threads"
          ],
          "sections": [
            {
              "type": "steps",
              "title": "Passo a passo",
              "items": [
                {
                  "label": "Ver todas as conexões ativas com detalhes",
                  "command": "SELECT id, user, host, db, command, time, state,\n       LEFT(info, 80) AS query\nFROM information_schema.processlist\nWHERE command <> 'Sleep'\nORDER BY time DESC;"
                },
                {
                  "label": "Contar conexões por usuário",
                  "command": "SELECT user, host, COUNT(*) AS total_conexoes,\n       COUNT(CASE WHEN command = 'Sleep' THEN 1 END) AS ociosas,\n       COUNT(CASE WHEN command <> 'Sleep' THEN 1 END) AS ativas\nFROM information_schema.processlist\nGROUP BY user, host\nORDER BY total_conexoes DESC;"
                },
                {
                  "label": "Queries rodando há mais de 30 segundos",
                  "command": "SELECT id, user, host, db, time, state, info AS query\nFROM information_schema.processlist\nWHERE command <> 'Sleep'\n  AND time > 30\nORDER BY time DESC;"
                },
                {
                  "label": "Verificar limite máximo de conexões e uso atual",
                  "command": "SHOW VARIABLES LIKE 'max_connections';\nSHOW STATUS LIKE 'Threads_connected';\nSHOW STATUS LIKE 'Max_used_connections';"
                }
              ]
            },
            {
              "type": "tip",
              "text": "Use `KILL <id>` para encerrar uma conexão ou query específica pelo ID listado no processlist."
            }
          ]
        },
        {
          "id": "status-servidor-mysql",
          "title": "Verificar Status e Variáveis do Servidor",
          "description": "Consulta métricas de uptime, configurações de memória, slow queries e estatísticas do InnoDB no MySQL.",
          "tags": [
            "status",
            "monitoramento",
            "show status",
            "variables",
            "uptime"
          ],
          "sections": [
            {
              "type": "steps",
              "title": "Passo a passo",
              "items": [
                {
                  "label": "Uptime e estatísticas gerais do servidor",
                  "command": "SHOW STATUS LIKE 'Uptime';\nSHOW STATUS LIKE 'Questions';\nSHOW STATUS LIKE 'Queries';\nSHOW STATUS LIKE 'Slow_queries';"
                },
                {
                  "label": "Principais variáveis de configuração",
                  "command": "SHOW VARIABLES LIKE 'innodb_buffer_pool_size';\nSHOW VARIABLES LIKE 'max_connections';\nSHOW VARIABLES LIKE 'query_cache_size';\nSHOW VARIABLES LIKE 'slow_query_log';\nSHOW VARIABLES LIKE 'long_query_time';"
                },
                {
                  "label": "Estatísticas do InnoDB (buffer pool, I/O, locks)",
                  "command": "SHOW ENGINE INNODB STATUS\\G"
                },
                {
                  "label": "Habilitar slow query log em tempo real (sem restart)",
                  "command": "SET GLOBAL slow_query_log = 'ON';\nSET GLOBAL long_query_time = 2;  -- queries acima de 2 segundos\nSHOW VARIABLES LIKE 'slow_query_log_file';  -- caminho do arquivo"
                }
              ]
            },
            {
              "type": "tip",
              "text": "O `SHOW ENGINE INNODB STATUS\\G` mostra o estado atual das transações, locks e buffer pool — ótimo para diagnosticar lentidão repentina."
            }
          ]
        }
      ]
    }
  ]
};
