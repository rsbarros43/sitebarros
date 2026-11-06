---
title: "E-Rows x A-Rows: descobrindo onde o otimizador errou com o plano real no Oracle"
descricao: "O EXPLAIN PLAN mostra o que o otimizador imaginou. O plano real mostra o que aconteceu. Um laboratório reproduzível para capturar, ler e corrigir uma estimativa errada de cardinalidade."
tipo: blog
categoria: Performance
tags: [oracle, performance, sql tuning, dbms_xplan, 19c]
---

Toda análise de SQL lento começa com a mesma pergunta: **o que o banco realmente fez?** O `EXPLAIN PLAN` não responde isso. Ele mostra o plano que o otimizador *pretende* usar, com números *estimados*. Quando o problema é uma estimativa errada — e quase sempre é —, olhar só para o plano estimado é procurar o erro dentro do próprio erro.

Neste artigo vou montar um laboratório pequeno, que você roda em qualquer banco 19c de teste, para mostrar:

- como capturar o **plano real** com estatísticas de execução;
- como ler as colunas que importam e achar a linha onde a estimativa descolou da realidade;
- como corrigir a causa (não o sintoma) e confirmar a correção no próprio plano.

## Estimado x real em uma frase

| | Plano estimado | Plano real |
|---|---|---|
| Como obter | `EXPLAIN PLAN` / `DBMS_XPLAN.DISPLAY` | `DBMS_XPLAN.DISPLAY_CURSOR` com `ALLSTATS LAST` |
| SQL é executado? | Não | Sim |
| Mostra | Custo e linhas **estimadas** (`E-Rows`) | Linhas **reais** (`A-Rows`), tempo, buffers, leituras |
| Pode ser diferente do que rodou? | Sim (binds, ambiente, adaptive plans) | Não — é o cursor que executou |

## O laboratório

Vou criar duas tabelas com uma armadilha clássica: **colunas correlacionadas**. Cada cidade pertence a uma única UF, mas o otimizador, por padrão, trata as colunas como independentes e multiplica as seletividades.

```sql
-- 1 milhão de pedidos, 100 cidades, cada cidade em uma das 10 UFs
CREATE TABLE lab_pedidos AS
SELECT ROWNUM                                   AS id_pedido,
       'CIDADE_' || LPAD(MOD(ROWNUM, 100), 3, '0') AS cidade,
       'UF_'     || MOD(MOD(ROWNUM, 100), 10)      AS uf,
       SYSDATE - MOD(ROWNUM, 365)               AS dt_pedido,
       RPAD('x', 80, 'x')                       AS observacao
FROM   (SELECT 1 FROM dual CONNECT BY LEVEL <= 1000),
       (SELECT 1 FROM dual CONNECT BY LEVEL <= 1000);

-- 3 itens por pedido
CREATE TABLE lab_itens AS
SELECT p.id_pedido,
       n.item,
       ROUND(DBMS_RANDOM.VALUE(10, 500), 2) AS valor
FROM   lab_pedidos p,
       (SELECT LEVEL AS item FROM dual CONNECT BY LEVEL <= 3) n;

CREATE INDEX lab_itens_ix1 ON lab_itens (id_pedido);

EXEC DBMS_STATS.GATHER_TABLE_STATS(USER, 'LAB_PEDIDOS');
EXEC DBMS_STATS.GATHER_TABLE_STATS(USER, 'LAB_ITENS');
```

Agora a consulta. Vou filtrar uma cidade **e** a UF dela:

```sql
SELECT COUNT(*), SUM(i.valor)
FROM   lab_pedidos p
JOIN   lab_itens   i ON i.id_pedido = p.id_pedido
WHERE  p.cidade = 'CIDADE_007'
AND    p.uf     = 'UF_7';
```

Pela lógica dos dados, a cidade sozinha já devolve 1% da tabela (**10.000 pedidos**), e a UF não filtra nada a mais. Mas o otimizador calcula `1/100 × 1/10 = 1/1000` e estima apenas **1.000 pedidos** — dez vezes menos.

## Passo 1 — Capturar o plano real

Há duas formas seguras de fazer o Oracle coletar as estatísticas de cada linha do plano:

**Opção A — hint na própria consulta** (ideal para testes):

```sql
SELECT /*+ GATHER_PLAN_STATISTICS */ COUNT(*), SUM(i.valor)
FROM   lab_pedidos p
JOIN   lab_itens   i ON i.id_pedido = p.id_pedido
WHERE  p.cidade = 'CIDADE_007'
AND    p.uf     = 'UF_7';
```

**Opção B — na sessão** (quando você vai rodar vários SQLs ou não quer mexer no texto):

```sql
ALTER SESSION SET statistics_level = ALL;
-- execute o SQL normalmente
ALTER SESSION SET statistics_level = TYPICAL;
```

> **Evite** ligar `STATISTICS_LEVEL = ALL` no nível de sistema em produção: a coleta por linha do plano tem custo de CPU para todas as sessões.

Logo depois da execução, **na mesma sessão**, mostre o plano do último cursor executado:

```sql
SELECT *
FROM   TABLE(DBMS_XPLAN.DISPLAY_CURSOR(NULL, NULL, 'ALLSTATS LAST'));
```

Para analisar o SQL de outra sessão, use o `SQL_ID` e o `CHILD_NUMBER`:

```sql
SELECT sql_id, child_number, executions, plan_hash_value,
       ROUND(elapsed_time / NULLIF(executions, 0) / 1e6, 3) AS seg_por_exec
FROM   v$sql
WHERE  sql_text LIKE '%lab_pedidos%'
AND    sql_text NOT LIKE '%v$sql%';

SELECT *
FROM   TABLE(DBMS_XPLAN.DISPLAY_CURSOR('&sql_id', &child, 'ALLSTATS LAST'));
```

> Se o cursor foi executado **sem** hint ou `STATISTICS_LEVEL = ALL`, as colunas `A-Rows`, `A-Time` e `Buffers` virão vazias e o `DBMS_XPLAN` avisará isso em uma nota no final.

## Passo 2 — Ler o plano: as colunas que importam

Uma saída típica deste laboratório se parece com isto (formato resumido; os números exatos variam no seu ambiente):

```plaintext
--------------------------------------------------------------------------------------------
| Id | Operation                      | Name          | Starts | E-Rows | A-Rows | Buffers |
--------------------------------------------------------------------------------------------
|  0 | SELECT STATEMENT               |               |      1 |        |      1 |   45210 |
|  1 |  SORT AGGREGATE                |               |      1 |      1 |      1 |   45210 |
|  2 |   NESTED LOOPS                 |               |      1 |   3000 |  30000 |   45210 |
|  3 |    NESTED LOOPS                |               |      1 |   3000 |  30000 |   15190 |
|* 4 |     TABLE ACCESS FULL          | LAB_PEDIDOS   |      1 |   1000 |  10000 |   13120 |
|* 5 |     INDEX RANGE SCAN           | LAB_ITENS_IX1 |  10000 |      3 |  30000 |    2070 |
|  6 |    TABLE ACCESS BY INDEX ROWID | LAB_ITENS     |  30000 |      1 |  30000 |   30020 |
--------------------------------------------------------------------------------------------
```

O que cada coluna diz:

- **Starts** — quantas vezes a operação foi executada. Em `NESTED LOOPS`, o lado interno roda uma vez para cada linha do lado externo.
- **E-Rows** — linhas estimadas **por execução** (por *start*).
- **A-Rows** — linhas reais, **somando todas as execuções**.
- **A-Time** e **Buffers** — tempo e blocos lidos, **acumulados** da operação e de todos os seus filhos.
- **Reads** — blocos lidos de disco (aparece quando houve I/O físico).

### A regra de ouro

Compare sempre:

```plaintext
E-Rows × Starts   versus   A-Rows
```

- Na linha 4: `1000 × 1 = 1.000` estimadas contra `10.000` reais → **erro de 10x**.
- Na linha 5: `3 × 10.000 = 30.000` contra `30.000` → estimativa correta.

A primeira linha (de dentro para fora, de baixo para cima) onde a diferença é grande — algo acima de 10x merece atenção — é **onde o problema nasce**. Tudo que vem acima dela herda o erro. Aqui, o otimizador escolheu `NESTED LOOPS` com 10 mil acessos por índice porque achava que seriam só mil.

### Dica: tempo e buffers são acumulados

Para saber quanto uma operação gastou **sozinha**, subtraia o valor dos filhos diretos. Na linha 2, por exemplo: `45210 − 15190 = 30020` buffers gastos no acesso à tabela `LAB_ITENS` (linha 6). É assim que se descobre qual passo realmente consome o recurso.

## Passo 3 — Ver as predicates (o porquê da estimativa)

Use o formato `+PREDICATE` (ou `ALLSTATS LAST +PEEKED_BINDS` quando houver binds) para ver os filtros aplicados em cada linha marcada com `*`:

```sql
SELECT *
FROM   TABLE(DBMS_XPLAN.DISPLAY_CURSOR(NULL, NULL, 'ALLSTATS LAST +PREDICATE +PEEKED_BINDS'));
```

Na linha 4 aparece `filter(("P"."CIDADE"='CIDADE_007' AND "P"."UF"='UF_7'))` — duas colunas no mesmo filtro, exatamente o cenário de correlação.

## Passo 4 — Corrigir a causa: estatística estendida

O erro não está no índice nem no join: está no fato de o otimizador não saber que `CIDADE` e `UF` andam juntas. A correção é ensinar isso a ele com um **grupo de colunas**:

```sql
SELECT DBMS_STATS.CREATE_EXTENDED_STATS(USER, 'LAB_PEDIDOS', '(CIDADE,UF)')
FROM   dual;

EXEC DBMS_STATS.GATHER_TABLE_STATS(USER, 'LAB_PEDIDOS', method_opt => 'FOR ALL COLUMNS SIZE AUTO FOR COLUMNS (CIDADE,UF) SIZE AUTO');
```

Rode a consulta de novo com o hint e compare: a linha do `LAB_PEDIDOS` passa a estimar algo próximo de **10.000**, e o otimizador tende a trocar os `NESTED LOOPS` por um `HASH JOIN` com menos buffers. O plano real é a prova de que a correção funcionou.

> Para encontrar candidatos a grupos de colunas em uma carga real, o Oracle pode monitorar o uso conjunto de colunas com `DBMS_STATS.SEED_COL_USAGE` e sugerir os grupos via `DBMS_STATS.REPORT_COL_USAGE`.

## `ALLSTATS` ou `ALLSTATS LAST`?

- **`ALLSTATS LAST`** — somente a **última execução** do cursor. É o que você quer na maioria das análises.
- **`ALLSTATS`** — soma de **todas as execuções** desde que o cursor entrou na shared pool. Útil para ver o comportamento médio, mas mistura execuções com binds diferentes.

## Armadilhas comuns

- **Cursor reotimizado:** no 12c+ o *statistics feedback* pode criar um novo child cursor na segunda execução, com um plano melhor. Confira `IS_REOPTIMIZABLE` em `V$SQL` e analise o child certo.
- **Adaptive plans:** o plano estimado pode mostrar um join que foi trocado em tempo de execução. Use o formato `+ADAPTIVE` para ver as linhas inativas.
- **RAC:** `DISPLAY_CURSOR` lê a shared pool **da instância em que você está conectado**. Se o SQL rodou em outra instância, conecte-se nela (veja `INST_ID` em `GV$SQL`).
- **Plano do AWR:** `DBMS_XPLAN.DISPLAY_AWR` mostra o histórico de planos de um `SQL_ID`, mas **sem** `A-Rows` — serve para comparar planos ao longo do tempo, não para medir o erro de estimativa.
- **SQL que não termina:** se a consulta leva horas, o **SQL Monitor** (`DBMS_SQLTUNE.REPORT_SQL_MONITOR`, licença Tuning Pack) mostra as linhas reais **durante** a execução, sem esperar o fim.

## Resumo

1. Execute o SQL com `/*+ GATHER_PLAN_STATISTICS */` ou `STATISTICS_LEVEL = ALL` na sessão.
2. Exiba com `DBMS_XPLAN.DISPLAY_CURSOR(..., 'ALLSTATS LAST')`.
3. Compare `E-Rows × Starts` com `A-Rows`, de dentro para fora.
4. Ache a primeira linha com erro grande e investigue o filtro dela.
5. Corrija a causa (estatísticas, histogramas, grupos de colunas) e **confirme no novo plano real**.

Para limpar o laboratório:

```sql
DROP TABLE lab_itens PURGE;
DROP TABLE lab_pedidos PURGE;
```

## Referências

- [Oracle Database 19c — SQL Tuning Guide](https://docs.oracle.com/en/database/oracle/oracle-database/19/tgsql/) (capítulos *Reading Execution Plans* e *Managing Extended Statistics*)
- [Oracle Database 19c — PL/SQL Packages: DBMS_XPLAN](https://docs.oracle.com/en/database/oracle/oracle-database/19/arpls/DBMS_XPLAN.html)
- Leitura recomendada sobre o tema: [Plano de execução real no Oracle — DBA Sobrinho](https://dbasobrinho.com.br/plano-de-execucao-real-oracle/)
