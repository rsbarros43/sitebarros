
(() => {
  'use strict';

  const ADMIN_PASSWORD = 'NOVOPROJETO';
  const $ = id => document.getElementById(id);

  const login = $('adminPreviewLogin');
  const consoleEl = $('adminConsole');
  const adminButton = $('adminLockBtn');

  function showToast(message, type = 'success') {
    const toast = $('adminToast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `admin-toast ${type}`;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.add('hidden'), 3200);
  }

  function openLogin() {
    login.classList.remove('hidden');
    login.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('adminPreviewPassword').value = '';
    $('adminPreviewError').textContent = '';
    setTimeout(() => $('adminPreviewPassword').focus(), 50);
  }

  function closeLogin() {
    login.classList.add('hidden');
    login.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function openConsole() {
    closeLogin();
    consoleEl.classList.remove('hidden');
    consoleEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    sessionStorage.setItem('dbatoolkit-admin-preview', 'authenticated');
    buildDashboard();
    buildContentTable();
  }

  function closeConsole() {
    consoleEl.classList.add('hidden');
    consoleEl.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function loginAttempt() {
    if ($('adminPreviewPassword').value === ADMIN_PASSWORD) {
      openConsole();
    } else {
      $('adminPreviewError').textContent = 'Senha incorreta. Utilize DBATOOLKIT nesta versão de validação.';
      $('adminPreviewPassword').select();
    }
  }

  function switchView(view) {
    document.querySelectorAll('[data-admin-panel]').forEach(panel => {
      panel.classList.toggle('active', panel.dataset.adminPanel === view);
    });
    document.querySelectorAll('[data-admin-view]').forEach(button => {
      button.classList.toggle('active', button.dataset.adminView === view);
    });
    document.querySelector('.admin-console-main')?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function getStats() {
    const categories = Array.isArray(CONTENT?.categories) ? CONTENT.categories : [];
    const topics = categories.flatMap(category => category.topics || []);
    const steps = topics.reduce((total, topic) => {
      return total + (topic.sections || []).reduce((count, section) => {
        return count + (section.type === 'steps' ? (section.items || []).length : 0);
      }, 0);
    }, 0);
    const commands = topics.reduce((total, topic) => {
      return total + (topic.sections || []).reduce((count, section) => {
        if (section.type !== 'steps') return count;
        return count + (section.items || []).filter(item => item.command).length;
      }, 0);
    }, 0);
    return { categories, topics, steps, commands };
  }

  function buildDashboard() {
    const { categories, topics, steps, commands } = getStats();
    const drafts = JSON.parse(localStorage.getItem('dbatoolkit-admin-drafts') || '[]');

    const stats = [
      { icon: 'DB', label: 'Tópicos publicados', value: topics.length, detail: 'Conteúdo público', tone: 'orange' },
      { icon: '⌘', label: 'Comandos técnicos', value: commands, detail: `${steps} passos documentados`, tone: 'cyan' },
      { icon: '▦', label: 'Plataformas', value: categories.length, detail: 'Oracle, SQL Server, PostgreSQL e MySQL', tone: 'green' },
      { icon: '✎', label: 'Rascunhos locais', value: drafts.length, detail: 'Aguardando revisão', tone: 'purple' }
    ];

    $('adminStatGrid').innerHTML = stats.map(stat => `
      <article class="admin-stat-card ${stat.tone}">
        <span class="admin-stat-icon">${stat.icon}</span>
        <div><strong>${stat.value}</strong><h3>${stat.label}</h3><p>${stat.detail}</p></div>
      </article>
    `).join('');

    const max = Math.max(...categories.map(category => category.topics.length));
    $('adminPlatformBars').innerHTML = categories.map(category => `
      <div class="admin-platform-bar">
        <div class="admin-platform-bar-head">
          <span><i style="background:${category.color}"></i>${category.name}</span>
          <strong>${category.topics.length} tópicos</strong>
        </div>
        <div class="admin-platform-track"><span style="width:${(category.topics.length / max) * 100}%;background:${category.color}"></span></div>
      </div>
    `).join('');
  }

  function contentRows() {
    return CONTENT.categories.flatMap(category =>
      category.topics.map(topic => {
        const steps = (topic.sections || []).reduce((total, section) =>
          total + (section.type === 'steps' ? (section.items || []).length : 0), 0);
        return { category, topic, steps };
      })
    );
  }

  function buildContentTable() {
    const query = ($('adminContentSearch')?.value || '').trim().toLowerCase();
    const filter = $('adminContentFilter')?.value || 'all';

    const rows = contentRows().filter(({ category, topic }) => {
      const matchesPlatform = filter === 'all' || category.id === filter;
      const haystack = [topic.title, topic.description, ...(topic.tags || [])].join(' ').toLowerCase();
      return matchesPlatform && (!query || haystack.includes(query));
    });

    $('adminResultCounter').textContent = `${rows.length} tópico${rows.length === 1 ? '' : 's'}`;
    $('adminContentRows').innerHTML = rows.map(({ category, topic, steps }) => `
      <tr>
        <td><strong>${topic.title}</strong><small>${topic.description || ''}</small></td>
        <td><span class="admin-platform-chip"><i style="background:${category.color}"></i>${category.name}</span></td>
        <td><div class="admin-table-tags">${(topic.tags || []).slice(0, 3).map(tag => `<span>${tag}</span>`).join('')}</div></td>
        <td>${steps}</td>
        <td><span class="admin-status published">Publicado</span></td>
        <td>
          <div class="admin-row-actions">
            <button type="button" data-admin-action="preview" data-cat="${category.id}" data-topic="${topic.id}">Visualizar</button>
            <button type="button" data-admin-action="edit">Editar</button>
          </div>
        </td>
      </tr>
    `).join('');

    $('adminContentRows').querySelectorAll('[data-admin-action="preview"]').forEach(button => {
      button.addEventListener('click', () => {
        closeConsole();
        document.querySelector(`[data-topic-id="${button.dataset.topic}"]`)?.click();
      });
    });

    $('adminContentRows').querySelectorAll('[data-admin-action="edit"]').forEach(button => {
      button.addEventListener('click', () => showToast('Editor de conteúdo será conectado ao backend em uma próxima etapa.', 'info'));
    });
  }

  function createStep(index = 1) {
    const wrapper = document.createElement('div');
    wrapper.className = 'admin-draft-step';
    wrapper.innerHTML = `
      <div class="admin-draft-step-head">
        <strong>Passo ${index}</strong>
        <button type="button" aria-label="Remover passo">×</button>
      </div>
      <label><span>Descrição do passo</span><input type="text" placeholder="Ex.: Verificar sessões ativas"></label>
      <label><span>Comando</span><textarea rows="4" placeholder="SELECT ..."></textarea></label>
    `;
    wrapper.querySelector('button').addEventListener('click', () => {
      wrapper.remove();
      renumberSteps();
    });
    return wrapper;
  }

  function renumberSteps() {
    const steps = [...$('adminDraftSteps').children];
    steps.forEach((step, index) => step.querySelector('strong').textContent = `Passo ${index + 1}`);
    $('adminSummarySteps').textContent = Math.max(steps.length, 0);
  }

  function resetDraft() {
    $('adminTopicForm').reset();
    $('adminDraftSteps').innerHTML = '';
    $('adminDraftSteps').appendChild(createStep(1));
    renumberSteps();
    $('adminSummaryPlatform').textContent = 'Oracle';
  }

  function saveDraft(event) {
    event.preventDefault();
    const steps = [...$('adminDraftSteps').children].map(step => ({
      label: step.querySelector('input').value.trim(),
      command: step.querySelector('textarea').value.trim()
    })).filter(step => step.label || step.command);

    const draft = {
      id: `draft-${Date.now()}`,
      platform: $('adminTopicPlatform').value,
      status: $('adminTopicStatus').value,
      title: $('adminTopicTitle').value.trim(),
      description: $('adminTopicDescription').value.trim(),
      tags: $('adminTopicTags').value.split(',').map(tag => tag.trim()).filter(Boolean),
      steps,
      createdAt: new Date().toISOString()
    };

    const drafts = JSON.parse(localStorage.getItem('dbatoolkit-admin-drafts') || '[]');
    drafts.unshift(draft);
    localStorage.setItem('dbatoolkit-admin-drafts', JSON.stringify(drafts));
    buildDashboard();
    resetDraft();
    showToast('Rascunho salvo com sucesso no navegador.');
  }

  function downloadJson(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  function bindEvents() {
    if (adminButton) {
      const cleanButton = adminButton.cloneNode(true);
      adminButton.parentNode.replaceChild(cleanButton, adminButton);
      cleanButton.addEventListener('click', openLogin);
    }

    $('adminPreviewLoginClose').addEventListener('click', closeLogin);
    $('adminPreviewCancel').addEventListener('click', closeLogin);
    $('adminPreviewSubmit').addEventListener('click', loginAttempt);
    $('adminPreviewPassword').addEventListener('keydown', event => {
      if (event.key === 'Enter') loginAttempt();
    });
    $('adminTogglePassword').addEventListener('click', () => {
      const input = $('adminPreviewPassword');
      input.type = input.type === 'password' ? 'text' : 'password';
    });
    login.querySelector('.admin-preview-backdrop').addEventListener('click', closeLogin);

    $('adminLogout').addEventListener('click', () => {
      sessionStorage.removeItem('dbatoolkit-admin-preview');
      closeConsole();
    });
    $('adminOpenPublic').addEventListener('click', closeConsole);

    document.querySelectorAll('[data-admin-view]').forEach(button =>
      button.addEventListener('click', () => switchView(button.dataset.adminView))
    );
    document.querySelectorAll('[data-go-admin-view]').forEach(button =>
      button.addEventListener('click', () => switchView(button.dataset.goAdminView))
    );

    $('adminContentSearch').addEventListener('input', buildContentTable);
    $('adminContentFilter').addEventListener('change', buildContentTable);

    $('adminAddStep').addEventListener('click', () => {
      $('adminDraftSteps').appendChild(createStep($('adminDraftSteps').children.length + 1));
      renumberSteps();
    });
    $('adminClearDraft').addEventListener('click', resetDraft);
    $('adminTopicPlatform').addEventListener('change', () => {
      const names = { oracle: 'Oracle', sqlserver: 'SQL Server', postgresql: 'PostgreSQL', mysql: 'MySQL' };
      $('adminSummaryPlatform').textContent = names[$('adminTopicPlatform').value];
    });
    $('adminTopicForm').addEventListener('submit', saveDraft);

    $('adminProfileForm').addEventListener('submit', event => {
      event.preventDefault();
      showToast('Perfil salvo localmente para validação.');
    });

    $('adminExportContent').addEventListener('click', () =>
      downloadJson('dbatoolkit-content-backup.json', CONTENT)
    );
    $('adminExportDrafts').addEventListener('click', () =>
      downloadJson('dbatoolkit-admin-drafts.json', JSON.parse(localStorage.getItem('dbatoolkit-admin-drafts') || '[]'))
    );
    $('adminImportFile').addEventListener('change', async event => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        JSON.parse(await file.text());
        showToast(`Arquivo ${file.name} validado com sucesso.`);
      } catch {
        showToast('O arquivo selecionado não contém um JSON válido.', 'error');
      }
      event.target.value = '';
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    resetDraft();
    buildDashboard();
    buildContentTable();
  });
})();
