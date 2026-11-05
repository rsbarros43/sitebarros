-- ============================================================================
-- weekly_growth_report.sql — Analisa o crescimento da tabela de checkpoint
-- e o volume de mudanças processadas na última semana, útil para relatórios
-- de capacidade e para justificar upgrades de infraestrutura.
--
-- Execute conectado ao schema administrador do GoldenGate (ex: ggadmin).
-- ============================================================================

SET LINESIZE 200
SET PAGESIZE 50
COLUMN table_name     FORMAT A28
COLUMN size_mb         FORMAT 999,999.99
COLUMN num_rows        FORMAT 999,999,999

PROMPT === Tamanho das tabelas de checkpoint e heartbeat ===
SELECT
    segment_name AS table_name,
    ROUND(bytes/1024/1024, 2) AS size_mb
FROM
    dba_segments
WHERE
    segment_name IN ('OGG_CHECKPOINTS', 'GGSCHKPT', 'GG_LAG')
ORDER BY
    bytes DESC;

PROMPT
PROMPT === Estatísticas de heartbeat dos últimos 7 dias ===
SELECT
    source_db,
    target_db,
    COUNT(*) AS medicoes,
    ROUND(AVG(CASE WHEN incoming_lag IS NOT NULL THEN 1 ELSE 0 END),2) AS pct_com_dado
FROM
    gg_lag
WHERE
    last_updated_time >= SYSDATE - 7
GROUP BY
    source_db, target_db;

-- Dica: rode semanalmente (ex: toda segunda-feira) e arquive a saída para
-- construir uma série histórica de capacidade ao longo dos meses.
