-- ============================================================================
-- heartbeat_report.sql — Consulta o histórico de latência ponta a ponta
-- registrado pelas Heartbeat Tables do GoldenGate, separando o lag de
-- captura (origem) do lag de aplicação (destino). Execute conectado ao
-- schema administrador do GoldenGate (ex: ggadmin).
--
-- Pré-requisito: ADD HEARTBEATTABLE já configurado (ver Módulo 09).
-- ============================================================================

SET LINESIZE 200
SET PAGESIZE 50
COLUMN source_db        FORMAT A15
COLUMN target_db        FORMAT A15
COLUMN incoming_lag     FORMAT A14
COLUMN outgoing_lag     FORMAT A14
COLUMN last_updated     FORMAT A20

SELECT
    source_db,
    target_db,
    incoming_lag,
    outgoing_lag,
    TO_CHAR(last_updated_time, 'YYYY-MM-DD HH24:MI:SS') AS last_updated
FROM
    gg_lag
ORDER BY
    last_updated_time DESC
FETCH FIRST 50 ROWS ONLY;

-- Dica: se INCOMING_LAG estiver alto, o gargalo geralmente está na origem
-- (captura). Se apenas OUTGOING_LAG estiver alto, investigue o banco de
-- destino (contenção, índices, I/O) antes de tunar o GoldenGate.
