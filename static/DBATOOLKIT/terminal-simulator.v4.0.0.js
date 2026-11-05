
(() => {
  'use strict';

  const overlay = document.getElementById('commandTerminalOverlay');
  const screen = document.getElementById('commandTerminalScreen');
  const output = document.getElementById('terminalRuntimeOutput');
  const commandEl = document.getElementById('terminalRuntimeCommand');
  const promptEl = document.getElementById('terminalRuntimePrompt');
  const platformEl = document.getElementById('terminalPlatform');
  const databaseEl = document.getElementById('terminalDatabase');
  const hostEl = document.getElementById('terminalHost');
  const sessionEl = document.getElementById('terminalSession');
  const subtitleEl = document.getElementById('commandTerminalSubtitle');
  const statusEl = document.getElementById('terminalExecutionStatus');
  const timeEl = document.getElementById('terminalExecutionTime');
  const rowsEl = document.getElementById('terminalExecutionRows');

  let currentCommand = '';
  let currentPlatform = 'oracle';
  let runningTimers = [];

  const profiles = {
    oracle: {
      name: 'Oracle Database',
      prompt: 'SQL>',
      database: 'ORCLPDB1',
      host: 'oracle19c.lab.local',
      session: 'SYSDBA',
      subtitle: 'Oracle SQL*Plus Simulator'
    },
    sqlserver: {
      name: 'SQL Server',
      prompt: '1>',
      database: 'FINANCE_PROD',
      host: 'sql2022-cluster.lab.local',
      session: 'DBA_ADMIN',
      subtitle: 'Microsoft SQL Server Terminal'
    },
    postgresql: {
      name: 'PostgreSQL',
      prompt: 'postgres=#',
      database: 'postgres',
      host: 'pg16-primary.lab.local',
      session: 'postgres',
      subtitle: 'PostgreSQL psql Simulator'
    },
    mysql: {
      name: 'MySQL',
      prompt: 'mysql>',
      database: 'erp_prod',
      host: 'mysql8-primary.lab.local',
      session: 'root@localhost',
      subtitle: 'MySQL Client Simulator'
    }
  };

  const escapeHtml = value => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  function identifyPlatform(button) {
    const activeCategory = document.querySelector('.nav-category:not(.collapsed) .nav-item.active');
    const topicViewText = document.getElementById('topicView')?.textContent?.toLowerCase() || '';
    const breadcrumb = button.closest('#topicView')?.querySelector('.topic-breadcrumb')?.textContent?.toLowerCase() || '';
    const combined = `${activeCategory?.closest('.nav-category')?.textContent || ''} ${breadcrumb} ${topicViewText}`;

    if (combined.includes('sql server')) return 'sqlserver';
    if (combined.includes('postgresql')) return 'postgresql';
    if (combined.includes('mysql')) return 'mysql';
    return 'oracle';
  }

  function clearTimers() {
    runningTimers.forEach(clearTimeout);
    runningTimers = [];
  }

  function addTerminalButtons(root = document) {
    root.querySelectorAll('.code-block').forEach(block => {
      if (block.querySelector('.terminal-open-btn')) return;

      const copy = block.querySelector('.copy-btn');
      if (!copy) return;

      const actions = document.createElement('div');
      actions.className = 'code-action-buttons';

      const terminalButton = document.createElement('button');
      terminalButton.type = 'button';
      terminalButton.className = 'terminal-open-btn';
      terminalButton.innerHTML = '<span>▣</span> Abrir Terminal';

      copy.parentNode.insertBefore(actions, copy);
      actions.append(copy, terminalButton);

      terminalButton.addEventListener('click', event => {
        event.stopPropagation();
        const command = block.querySelector('pre')?.textContent?.trim() || '';
        openTerminal(command, identifyPlatform(terminalButton));
      });
    });
  }

  function openTerminal(command, platform) {
    currentCommand = command;
    currentPlatform = platform;
    const profile = profiles[platform];

    commandEl.textContent = command;
    promptEl.textContent = profile.prompt;
    platformEl.textContent = profile.name;
    databaseEl.textContent = profile.database;
    hostEl.textContent = profile.host;
    sessionEl.textContent = profile.session;
    subtitleEl.textContent = profile.subtitle;

    resetTerminal();
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeTerminal() {
    clearTimers();
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function resetTerminal() {
    clearTimers();
    output.innerHTML = `<pre class="runtime-transcript-ready">${escapeHtml(
      `${profiles[currentPlatform].prompt} ${currentCommand}
`
    )}<span class="terminal-cursor-block"> </span></pre>`;
    statusEl.textContent = 'READY';
    statusEl.className = '';
    timeEl.textContent = 'Tempo: --';
    rowsEl.textContent = 'Linhas: --';
    screen.classList.remove('running');
  }

  function stripMarkup(value) {
    const holder = document.createElement('div');
    holder.innerHTML = String(value);
    return (holder.textContent || holder.innerText || '').trim();
  }

  function table(headers, rows) {
    const cleanHeaders = headers.map(stripMarkup);
    const cleanRows = rows.map(row => row.map(stripMarkup));

    const widths = cleanHeaders.map((header, index) => {
      const values = cleanRows.map(row => row[index] || '');
      return Math.min(
        34,
        Math.max(header.length, ...values.map(value => value.length))
      );
    });

    const formatRow = row => row.map((value, index) => {
      const text = String(value || '');
      const clipped = text.length > widths[index]
        ? text.slice(0, Math.max(1, widths[index] - 3)) + '...'
        : text;
      return clipped.padEnd(widths[index], ' ');
    }).join('  ');

    const headerLine = formatRow(cleanHeaders);
    const separator = widths.map(width => '-'.repeat(width)).join('  ');
    const dataLines = cleanRows.map(formatRow).join('\n');

    return `<pre class="runtime-plain-output">${escapeHtml(
      `${headerLine}\n${separator}\n${dataLines}`
    )}</pre>`;
  }

  function oracleResult(command) {
    const c = command.toLowerCase();

    if (c.includes('v$session') || c.includes('gv$session')) {
      return {
        rows: 5,
        html: table(
          ['SID', 'SERIAL#', 'USERNAME', 'MACHINE', 'SQL_ID', 'STATUS', 'CPU_SEC', 'MEMORY_MB'],
          [
            ['137', '48291', 'APP_FIN', 'app-fin-01', '<code>7g8m4k2p9z1xq</code>', '<span class="runtime-status active">ACTIVE</span>', '<span class="runtime-hot">86.42</span>', '1284'],
            ['244', '19203', 'ERP_PROD', 'erp-api-03', '<code>2n5d8c7v1b4ma</code>', '<span class="runtime-status waiting">WAITING</span>', '48.71', '742'],
            ['311', '77320', 'BI_READ', 'powerbi-gw-02', '<code>9q1w6e3r8t5yu</code>', '<span class="runtime-status active">ACTIVE</span>', '27.10', '516'],
            ['418', '22418', 'BATCH', 'batch-ora-01', '<code>4a7s2d9f6g3hj</code>', '<span class="runtime-status inactive">INACTIVE</span>', '18.50', '388'],
            ['529', '61590', 'SYS', 'dba-console', '<code>1m2n3b4v5c6xz</code>', '<span class="runtime-status active">ACTIVE</span>', '2.14', '96']
          ]
        )
      };
    }

    if (c.includes('archive log list') || c.includes('log_mode')) {
      return {
        rows: 6,
        html: table(
          ['Parâmetro', 'Valor'],
          [
            ['Database log mode', 'Archive Mode'],
            ['Automatic archival', 'Enabled'],
            ['Archive destination', '+FRA'],
            ['Oldest online log sequence', '18472'],
            ['Next log sequence to archive', '18475'],
            ['Current log sequence', '18475']
          ]
        )
      };
    }

    if (c.includes('tablespace') || c.includes('dba_data_files') || c.includes('dba_free_space')) {
      return {
        rows: 5,
        html: table(
          ['TABLESPACE_NAME', 'TOTAL_GB', 'USED_GB', 'FREE_GB', 'PCT_USED', 'STATUS'],
          [
            ['SYSTEM', '12.00', '8.14', '3.86', '67.83%', '<span class="runtime-status active">OK</span>'],
            ['SYSAUX', '18.00', '13.82', '4.18', '76.78%', '<span class="runtime-status active">OK</span>'],
            ['USERS', '40.00', '32.81', '7.19', '<span class="runtime-hot">82.03%</span>', '<span class="runtime-status waiting">WARNING</span>'],
            ['UNDO01', '16.00', '9.44', '6.56', '59.00%', '<span class="runtime-status active">OK</span>'],
            ['TEMP', '20.00', '5.91', '14.09', '29.55%', '<span class="runtime-status active">OK</span>']
          ]
        )
      };
    }

    if (c.includes('rman') || c.includes('backup')) {
      return {
        rows: 4,
        html: table(
          ['KEY', 'TYPE', 'STATUS', 'COMPLETION_TIME', 'SIZE_GB'],
          [
            ['98142', 'FULL DATABASE', '<span class="runtime-status active">AVAILABLE</span>', '31-JUL-2026 09:14', '186.42'],
            ['98143', 'ARCHIVELOG', '<span class="runtime-status active">AVAILABLE</span>', '31-JUL-2026 09:28', '12.18'],
            ['98144', 'CONTROLFILE', '<span class="runtime-status active">AVAILABLE</span>', '31-JUL-2026 09:29', '0.02'],
            ['98145', 'SPFILE', '<span class="runtime-status active">AVAILABLE</span>', '31-JUL-2026 09:29', '0.01']
          ]
        )
      };
    }

    if (c.includes('v$database') || c.includes('database_role')) {
      return {
        rows: 1,
        html: table(
          ['NAME', 'OPEN_MODE', 'DATABASE_ROLE', 'PROTECTION_MODE', 'SWITCHOVER_STATUS'],
          [['ORCL', 'READ WRITE', 'PRIMARY', 'MAXIMUM PERFORMANCE', 'TO STANDBY']]
        )
      };
    }

    return {
      rows: 3,
      html: table(
        ['RESULT', 'VALUE', 'STATUS'],
        [
          ['Command parsed', 'Oracle SQL', '<span class="runtime-status active">SUCCESS</span>'],
          ['Execution mode', 'Read Only Demo', '<span class="runtime-status active">SAFE</span>'],
          ['Database', 'ORCLPDB1', '<span class="runtime-status active">OPEN</span>']
        ]
      )
    };
  }

  function sqlServerResult(command) {
    const c = command.toLowerCase();

    if (c.includes('dm_exec_requests') || c.includes('dm_exec_sessions') || c.includes('blocking')) {
      return {
        rows: 4,
        html: table(
          ['session_id', 'login_name', 'host_name', 'status', 'cpu_time_ms', 'memory_mb', 'blocking_session_id', 'wait_type'],
          [
            ['57', 'svc_finance', 'APP-SQL-01', '<span class="runtime-status active">running</span>', '<span class="runtime-hot">86420</span>', '924', '0', 'NULL'],
            ['61', 'erp_user', 'ERP-API-03', '<span class="runtime-status waiting">suspended</span>', '48710', '640', '57', 'LCK_M_X'],
            ['68', 'bi_reader', 'POWERBI-GW', '<span class="runtime-status active">running</span>', '27100', '512', '0', 'PAGEIOLATCH_SH'],
            ['74', 'sqlagent', 'SQL-AGENT-01', '<span class="runtime-status inactive">sleeping</span>', '1840', '96', '0', 'NULL']
          ]
        )
      };
    }

    if (c.includes('backup database') || c.includes('restore verifyonly')) {
      return {
        rows: 4,
        html: table(
          ['Database', 'Backup Type', 'Status', 'Backup Size', 'Duration'],
          [
            ['FINANCE_PROD', 'FULL', '<span class="runtime-status active">COMPLETED</span>', '142.8 GB', '00:18:42'],
            ['FINANCE_PROD', 'LOG', '<span class="runtime-status active">COMPLETED</span>', '1.7 GB', '00:00:38'],
            ['ERP_PROD', 'FULL', '<span class="runtime-status active">COMPLETED</span>', '96.4 GB', '00:12:09'],
            ['DBATOOLKIT', 'VERIFYONLY', '<span class="runtime-status active">VALID</span>', '—', '00:00:06']
          ]
        )
      };
    }

    if (c.includes('master_files') || c.includes('logspace')) {
      return {
        rows: 4,
        html: table(
          ['Database Name', 'Data Size MB', 'Log Size MB', 'Log Used %', 'Recovery Model'],
          [
            ['FINANCE_PROD', '184320', '16384', '42.18', 'FULL'],
            ['ERP_PROD', '102400', '8192', '<span class="runtime-hot">78.44</span>', 'FULL'],
            ['REPORTING', '76800', '4096', '18.72', 'SIMPLE'],
            ['tempdb', '32768', '8192', '31.04', 'SIMPLE']
          ]
        )
      };
    }

    return {
      rows: 3,
      html: table(
        ['Message', 'Database', 'Status'],
        [
          ['Command accepted', 'FINANCE_PROD', '<span class="runtime-status active">SUCCESS</span>'],
          ['Execution mode', 'Read Only Demo', '<span class="runtime-status active">SAFE</span>'],
          ['SQL Server', '2022 Enterprise', '<span class="runtime-status active">ONLINE</span>']
        ]
      )
    };
  }

  function postgresqlResult(command) {
    const c = command.toLowerCase();

    if (c.includes('pg_stat_activity') || c.includes('pg_blocking_pids')) {
      return {
        rows: 4,
        html: table(
          ['pid', 'usename', 'datname', 'client_addr', 'state', 'duration', 'wait_event', 'query'],
          [
            ['18422', 'app_fin', 'finance', '10.20.1.15', '<span class="runtime-status active">active</span>', '00:02:14', '—', 'SELECT fechamento_mensal...'],
            ['18507', 'erp_user', 'erp', '10.20.2.31', '<span class="runtime-status waiting">active</span>', '00:01:08', 'transactionid', 'UPDATE pedidos SET...'],
            ['18591', 'bi_read', 'analytics', '10.20.3.22', '<span class="runtime-status active">active</span>', '00:00:41', 'DataFileRead', 'SELECT vendas_por_regiao...'],
            ['18633', 'postgres', 'postgres', '127.0.0.1', '<span class="runtime-status inactive">idle</span>', '00:00:03', 'ClientRead', '—']
          ]
        )
      };
    }

    if (c.includes('pg_database_size') || c.includes('pg_total_relation_size')) {
      return {
        rows: 5,
        html: table(
          ['database/schema', 'object', 'table_size', 'indexes_size', 'total_size'],
          [
            ['finance', 'transactions', '48 GB', '19 GB', '67 GB'],
            ['erp', 'orders', '32 GB', '14 GB', '46 GB'],
            ['analytics', 'fact_sales', '29 GB', '8 GB', '37 GB'],
            ['finance', 'customers', '11 GB', '6 GB', '17 GB'],
            ['public', 'audit_log', '7 GB', '2 GB', '9 GB']
          ]
        )
      };
    }

    if (c.includes('vacuum') || c.includes('n_dead_tup')) {
      return {
        rows: 4,
        html: table(
          ['schemaname', 'relname', 'n_live_tup', 'n_dead_tup', 'last_autovacuum', 'recommendation'],
          [
            ['finance', 'transactions', '18442903', '<span class="runtime-hot">428194</span>', '2026-07-31 08:20', 'VACUUM ANALYZE'],
            ['erp', 'orders', '9182210', '74112', '2026-07-31 10:14', 'MONITOR'],
            ['public', 'audit_log', '4920118', '38214', '2026-07-31 09:01', 'MONITOR'],
            ['analytics', 'fact_sales', '13200942', '11208', '2026-07-31 11:47', 'OK']
          ]
        )
      };
    }

    return {
      rows: 3,
      html: table(
        ['message', 'database', 'status'],
        [
          ['Command accepted', 'postgres', '<span class="runtime-status active">SUCCESS</span>'],
          ['Execution mode', 'Read Only Demo', '<span class="runtime-status active">SAFE</span>'],
          ['PostgreSQL', '16.3', '<span class="runtime-status active">accepting connections</span>']
        ]
      )
    };
  }

  function mysqlResult(command) {
    const c = command.toLowerCase();

    if (c.includes('processlist') || c.includes('innodb_trx') || c.includes('data_lock_waits')) {
      return {
        rows: 4,
        html: table(
          ['ID', 'USER', 'HOST', 'DB', 'COMMAND', 'TIME', 'STATE', 'CPU %', 'MEMORY MB'],
          [
            ['84721', 'app_fin', 'app-fin-01:51244', 'finance', 'Query', '134', '<span class="runtime-status active">Sending data</span>', '<span class="runtime-hot">82.4</span>', '768'],
            ['84803', 'erp_user', 'erp-api-03:49818', 'erp', 'Query', '68', '<span class="runtime-status waiting">Waiting for lock</span>', '44.7', '412'],
            ['84844', 'bi_read', 'powerbi-gw:53411', 'analytics', 'Query', '41', '<span class="runtime-status active">Executing</span>', '26.9', '286'],
            ['84901', 'event_scheduler', 'localhost', 'NULL', 'Daemon', '12094', '<span class="runtime-status inactive">Waiting</span>', '0.1', '18']
          ]
        )
      };
    }

    if (c.includes('information_schema.tables') || c.includes('table_schema')) {
      return {
        rows: 5,
        html: table(
          ['TABLE_SCHEMA', 'DATA_MB', 'INDEX_MB', 'TOTAL_MB', 'TABLES'],
          [
            ['finance', '148224.42', '38418.22', '186642.64', '214'],
            ['erp', '92118.14', '28142.89', '120261.03', '187'],
            ['analytics', '68421.09', '19444.20', '87865.29', '96'],
            ['audit', '18811.42', '2814.11', '21625.53', '28'],
            ['mysql', '4.88', '1.42', '6.30', '38']
          ]
        )
      };
    }

    if (c.includes('show replica status') || c.includes('replication')) {
      return {
        rows: 6,
        html: table(
          ['Variable', 'Value'],
          [
            ['Replica_IO_Running', '<span class="runtime-status active">Yes</span>'],
            ['Replica_SQL_Running', '<span class="runtime-status active">Yes</span>'],
            ['Source_Host', 'mysql8-primary.lab.local'],
            ['Seconds_Behind_Source', '2'],
            ['Retrieved_Gtid_Set', '3E11FA47:1-982144'],
            ['Last_SQL_Error', '']
          ]
        )
      };
    }

    return {
      rows: 3,
      html: table(
        ['Message', 'Database', 'Status'],
        [
          ['Command accepted', 'erp_prod', '<span class="runtime-status active">SUCCESS</span>'],
          ['Execution mode', 'Read Only Demo', '<span class="runtime-status active">SAFE</span>'],
          ['MySQL', '8.4 Enterprise', '<span class="runtime-status active">ONLINE</span>']
        ]
      )
    };
  }

  function resultFor(command, platform) {
    if (platform === 'sqlserver') return sqlServerResult(command);
    if (platform === 'postgresql') return postgresqlResult(command);
    if (platform === 'mysql') return mysqlResult(command);
    return oracleResult(command);
  }

  function executeCommand() {
    clearTimers();
    screen.classList.add('running');
    statusEl.textContent = 'RUNNING';
    statusEl.className = 'running';
    timeEl.textContent = 'Tempo: calculando...';
    rowsEl.textContent = 'Linhas: --';

    const profile = profiles[currentPlatform];
    const prompt = profile.prompt;
    const continuationPrompt = currentPlatform === 'oracle'
      ? '  2  '
      : currentPlatform === 'sqlserver'
        ? '2>'
        : currentPlatform === 'postgresql'
          ? 'postgres-#'
          : '    ->';

    const commandLines = currentCommand.split('\n');
    const formattedCommand = commandLines.map((line, index) =>
      `${index === 0 ? prompt : continuationPrompt} ${line}`
    ).join('\n');

    output.innerHTML = `<pre class="runtime-live-transcript">${escapeHtml(
      `${formattedCommand}\n\n`
    )}<span class="runtime-executing">executando...</span></pre>`;

    runningTimers.push(setTimeout(() => {
      const result = resultFor(currentCommand, currentPlatform);
      const elapsed = (Math.random() * 0.09 + 0.002).toFixed(3);

      const rowLabel = currentPlatform === 'oracle'
        ? `${result.rows} row${result.rows === 1 ? '' : 's'} selected.`
        : currentPlatform === 'sqlserver'
          ? `(${result.rows} row${result.rows === 1 ? '' : 's'} affected)`
          : currentPlatform === 'postgresql'
            ? `(${result.rows} row${result.rows === 1 ? '' : 's'})`
            : `${result.rows} row${result.rows === 1 ? '' : 's'} in set (${elapsed} sec)`;

      output.innerHTML = `
        <pre class="runtime-live-transcript">${escapeHtml(`${formattedCommand}\n\n`)}</pre>
        ${result.html}
        <pre class="runtime-client-footer">${escapeHtml(`\n${rowLabel}\n\n${prompt} `)}<span class="terminal-cursor-block"> </span></pre>
      `;

      statusEl.textContent = 'SUCCESS';
      statusEl.className = 'success';
      timeEl.textContent = `Tempo: ${elapsed}s`;
      rowsEl.textContent = `Linhas: ${result.rows}`;
      screen.classList.remove('running');
    }, 780));
  }

  document.querySelectorAll('[data-terminal-close]').forEach(button =>
    button.addEventListener('click', closeTerminal)
  );

  document.getElementById('terminalRunButton')?.addEventListener('click', executeCommand);
  document.getElementById('terminalReplayButton')?.addEventListener('click', executeCommand);
  document.getElementById('terminalClearButton')?.addEventListener('click', resetTerminal);
  document.getElementById('terminalCopyButton')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(currentCommand);
      document.getElementById('terminalCopyButton').textContent = '✓ Comando copiado';
      setTimeout(() => {
        document.getElementById('terminalCopyButton').textContent = '⧉ Copiar comando';
      }, 1400);
    } catch {}
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !overlay.classList.contains('hidden')) closeTerminal();
  });

  const observer = new MutationObserver(() => addTerminalButtons());
  observer.observe(document.body, { childList: true, subtree: true });

  document.addEventListener('DOMContentLoaded', () => addTerminalButtons());
  addTerminalButtons();
})();
