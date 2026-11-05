---
title: "Dica rápida: encontrando a sessão bloqueadora raiz no RAC"
descricao: "Uma consulta em GV$SESSION para identificar quem está no topo da cadeia de bloqueios em um ambiente Oracle RAC."
tipo: blog
categoria: Performance
tags: [oracle, rac, performance, sql, troubleshooting]
---

Usuários reclamando de lentidão, telas travadas e muitas sessões em `enq: TX - row lock contention`. Antes de sair matando sessões, descubra **quem está no topo da cadeia**.

Em RAC, use sempre as views `GV$` — o bloqueador pode estar em outra instância. A coluna `FINAL_BLOCKING_SESSION` já aponta a sessão raiz:

```sql
SELECT s.inst_id,
       s.sid,
       s.serial#,
       s.username,
       s.machine,
       s.program,
       s.sql_id,
       s.event,
       s.seconds_in_wait,
       s.blocking_instance,
       s.blocking_session,
       s.final_blocking_instance,
       s.final_blocking_session
FROM   gv$session s
WHERE  s.blocking_session IS NOT NULL
ORDER  BY s.seconds_in_wait DESC;
```

Depois, olhe a sessão raiz com calma — o que ela está fazendo, há quanto tempo está `INACTIVE`, qual o último SQL:

```sql
SELECT inst_id, sid, serial#, username, status, machine, program,
       sql_id, prev_sql_id, last_call_et, logon_time
FROM   gv$session
WHERE  (inst_id, sid) IN (
         SELECT DISTINCT final_blocking_instance, final_blocking_session
         FROM   gv$session
         WHERE  final_blocking_session IS NOT NULL
       );
```

Uma sessão `INACTIVE` com `LAST_CALL_ET` alto segurando lock geralmente é transação aberta sem `COMMIT` — muitas vezes de uma ferramenta cliente esquecida aberta. Antes de encerrar, alinhe com o responsável pela aplicação. Se for preciso matar, em RAC informe a instância:

```sql
ALTER SYSTEM KILL SESSION 'sid,serial#,@inst_id' IMMEDIATE;
```
