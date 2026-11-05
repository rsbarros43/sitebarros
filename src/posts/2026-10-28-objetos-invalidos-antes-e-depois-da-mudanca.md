---
title: "Objetos inválidos antes e depois de uma mudança no banco"
descricao: "Por que registrar a contagem e a lista de objetos inválidos antes e depois de uma GMUD — e as consultas que uso para isso."
tipo: blog
categoria: Oracle Database
tags: [oracle, gmud, sql, boas práticas]
---

Toda mudança em banco de produção (GMUD) tem um risco silencioso: **objetos que ficam inválidos** depois de um `ALTER TABLE`, de uma package recompilada ou de um grant removido. Se você não sabe quantos objetos já estavam inválidos *antes*, fica impossível afirmar se a mudança quebrou algo.

Por isso, no meu roteiro de execução, sempre registro a situação antes e depois.

## Antes da mudança

Contagem por owner e tipo:

```sql
SELECT owner, object_type, COUNT(*) AS qtd
FROM   dba_objects
WHERE  status = 'INVALID'
GROUP  BY owner, object_type
ORDER  BY owner, object_type;
```

E a lista detalhada, com os mais recentemente alterados primeiro:

```sql
SELECT owner, object_name, object_type, last_ddl_time
FROM   dba_objects
WHERE  status = 'INVALID'
ORDER  BY last_ddl_time DESC;
```

## Depois da mudança

Execute **as mesmas consultas**. Se surgiram novos inválidos, a coluna `LAST_DDL_TIME` ajuda a identificar o que foi afetado pela mudança — normalmente eles aparecem no topo da lista.

Para recompilar apenas um schema:

```sql
EXEC DBMS_UTILITY.COMPILE_SCHEMA(schema => 'NOME_DO_SCHEMA', compile_all => FALSE);
```

Ou, para o banco todo (com o usuário `SYS`), o script padrão:

```sql
@?/rdbms/admin/utlrp.sql
```

## Dica

Guarde a saída das duas execuções junto com a evidência da GMUD. Se alguém perguntar dias depois *"esse objeto ficou inválido por causa da mudança?"*, você responde com dados — e não com memória.
