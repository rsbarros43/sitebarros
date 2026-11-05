---
title: "Monitorando o Oracle Data Guard com SQL: status, lag e gaps"
descricao: "Um roteiro de consultas para verificar rapidamente a saúde de um ambiente Data Guard: papel do banco, transport e apply lag, gaps de archive e processos de recuperação."
tipo: artigo
categoria: Data Guard
tags: [oracle, data guard, alta disponibilidade, sql, 19c]
---

Quando alguém pergunta *"o standby está em dia?"*, a resposta precisa vir em segundos — e com números. Neste artigo reúno as consultas que uso para avaliar um ambiente **Oracle Data Guard** (testadas em 19c), sem depender de ferramentas gráficas.

> **Onde executar:** algumas views só trazem informação útil no standby (como `V$DATAGUARD_STATS`), outras fazem mais sentido no primário. Indico em cada passo.

## 1. Quem é quem: papel e modo de proteção

Comece confirmando o papel de cada banco e o modo de proteção configurado. Execute no primário **e** no standby:

```sql
SELECT name,
       db_unique_name,
       database_role,
       open_mode,
       protection_mode,
       protection_level,
       switchover_status
FROM   v$database;
```

O que observar:

- `DATABASE_ROLE` deve ser `PRIMARY` de um lado e `PHYSICAL STANDBY` do outro.
- Se `PROTECTION_LEVEL` for diferente de `PROTECTION_MODE`, o ambiente está operando abaixo do nível configurado (por exemplo, `MAXIMUM AVAILABILITY` caindo para `RESYNCHRONIZATION`).
- `OPEN_MODE = READ ONLY WITH APPLY` indica Active Data Guard em uso.

## 2. Transport lag e apply lag

No **standby**, a view `V$DATAGUARD_STATS` mostra o atraso de transporte e de aplicação:

```sql
SELECT name,
       value,
       unit,
       time_computed,
       datum_time
FROM   v$dataguard_stats
WHERE  name IN ('transport lag', 'apply lag', 'apply finish time');
```

Interpretação rápida:

- **transport lag** alto → problema de rede, de destino de archive (`LOG_ARCHIVE_DEST_n`) ou o primário não está enviando redo.
- **apply lag** alto com transport lag baixo → o redo chegou, mas o MRP está parado, lento ou aguardando algo.
- Compare `DATUM_TIME` com `SYSDATE`: se o valor estiver muito antigo, a estatística não está sendo atualizada — o que por si só já é um sinal de problema.

## 3. Processos de recuperação

A partir do 19c, prefira `V$DATAGUARD_PROCESS` (a antiga `V$MANAGED_STANDBY` está obsoleta). No **standby**:

```sql
SELECT name,
       role,
       action,
       client_role,
       thread#,
       sequence#,
       block#
FROM   v$dataguard_process
ORDER  BY role, name;
```

Procure pelo processo com `ROLE = 'recovery apply slave'` / `'managed recovery'` (MRP). Se não houver MRP, a aplicação de redo não está rodando. Para iniciar o apply em tempo real:

```sql
ALTER DATABASE RECOVER MANAGED STANDBY DATABASE DISCONNECT FROM SESSION;
```

> Se o ambiente é gerenciado pelo **Data Guard Broker**, prefira `DGMGRL> EDIT DATABASE '<standby>' SET STATE='APPLY-ON';` para manter a configuração do broker consistente.

## 4. Existe gap de archive?

No **standby**:

```sql
SELECT thread#,
       low_sequence#,
       high_sequence#
FROM   v$archive_gap;
```

Nenhuma linha retornada é o resultado esperado. Se houver gap, verifique se os archives faltantes ainda existem no primário (ou no backup) e se o FAL (`FAL_SERVER`) está configurado.

## 5. Última sequência recebida x aplicada, por thread

Em ambientes **RAC**, olhe cada thread separadamente. No **standby**:

```sql
SELECT thread#,
       MAX(sequence#)                                   AS ultima_recebida,
       MAX(CASE WHEN applied = 'YES' THEN sequence# END) AS ultima_aplicada
FROM   v$archived_log
WHERE  resetlogs_change# = (SELECT resetlogs_change# FROM v$database)
GROUP  BY thread#
ORDER  BY thread#;
```

Uma diferença de uma ou duas sequências é normal (o archive corrente ainda está sendo aplicado). Diferenças maiores e crescentes merecem investigação.

## 6. Destinos de archive com erro (no primário)

```sql
SELECT dest_id,
       dest_name,
       status,
       type,
       database_mode,
       recovery_mode,
       gap_status,
       error
FROM   v$archive_dest_status
WHERE  status <> 'INACTIVE';
```

Qualquer valor em `ERROR` ou `GAP_STATUS` diferente de `NO GAP` precisa ser tratado antes que o lag cresça.

## 7. Verificação via Broker

Se o broker estiver habilitado, ele resume tudo em um comando:

```plaintext
DGMGRL> SHOW CONFIGURATION LAG;
DGMGRL> VALIDATE DATABASE '<standby>';
```

O `VALIDATE DATABASE` é especialmente útil antes de um switchover planejado: ele aponta se o standby está pronto para assumir.

## Resumo: checklist rápido

| Verificação | Onde | Resultado esperado |
|---|---|---|
| Papel e modo de proteção | Ambos | `PROTECTION_LEVEL = PROTECTION_MODE` |
| Transport / apply lag | Standby | Próximo de zero (segundos) |
| Processo MRP | Standby | Presente e aplicando |
| `V$ARCHIVE_GAP` | Standby | Nenhuma linha |
| `V$ARCHIVE_DEST_STATUS` | Primário | Sem erro, `NO GAP` |

Com essas consultas em um script único, dá para responder em poucos segundos se o ambiente de DR está realmente pronto — e, melhor ainda, automatizar o envio desse resumo por e-mail. Esse será o tema de um próximo post.
