
(() => {
  'use strict';

  const descriptions = {
    oracle: 'Administração, performance, RMAN, Data Pump, segurança e diagnóstico de ambientes Oracle.',
    sqlserver: 'Consultas operacionais, backup, restore, locks e monitoramento para Microsoft SQL Server.',
    postgresql: 'Rotinas essenciais de administração, sessões, manutenção, backup e análise no PostgreSQL.',
    mysql: 'Comandos práticos para usuários, processos, performance, backup e operação de ambientes MySQL.'
  };

  const byId = id => document.getElementById(id);

  function escapeHtml(value = '') {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function callout(icon, text, type) {
    return `<div class="callout ${type}">
      <span class="callout-icon">${icon}</span>
      <span>${text}</span>
    </div>`;
  }

  function codeBlock(command) {
    return `<div class="code-block">
      <pre>${escapeHtml(command)}</pre>
      <button class="copy-btn" type="button">Copiar</button>
    </div>`;
  }

  function renderTopic(cat, topic) {
    const tags = (topic.tags || [])
      .map(tag => `<span class="tag">${escapeHtml(tag)}</span>`)
      .join('');

    const sections = (topic.sections || []).map(section => {
      if (section.type === 'warning') return callout('⚠️', section.text, 'warning');
      if (section.type === 'info') return callout('ℹ️', section.text, 'info');
      if (section.type === 'tip') return callout('💡', section.text, 'tip');
      if (section.type === 'result') return callout('✅', section.text, 'result');

      if (section.type === 'steps') {
        const steps = (section.items || []).map((item, index) => `
          <div class="step">
            <div class="step-num">${index + 1}</div>
            <div class="step-body">
              <div class="step-label">${escapeHtml(item.label)}</div>
              ${item.command ? codeBlock(item.command) : ''}
            </div>
          </div>
        `).join('');

        return `<div class="steps-section">
          ${section.title ? `<div class="steps-title">${escapeHtml(section.title)}</div>` : ''}
          ${steps}
        </div>`;
      }

      return '';
    }).join('');

    return `
      <div class="topic-breadcrumb">
        <span data-home-link>Início</span> ›
        <span data-category-link="${cat.id}" style="color:${cat.color}">${escapeHtml(cat.name)}</span> ›
        <span>${escapeHtml(topic.title)}</span>
      </div>
      <h1 class="topic-title">${escapeHtml(topic.title)}</h1>
      <p class="topic-description">${escapeHtml(topic.description || '')}</p>
      ${tags ? `<div class="topic-tags">${tags}</div>` : ''}
      ${sections}
    `;
  }

  function showHome() {
    byId('welcome')?.classList.remove('hidden');
    byId('topicView')?.classList.add('hidden');
    byId('searchResults')?.classList.add('hidden');
    byId('backBtn')?.classList.add('hidden');
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showCategory(catId) {
    const cat = CONTENT.categories.find(category => category.id === catId);
    const topicView = byId('topicView');
    if (!cat || !topicView) return;

    byId('welcome')?.classList.add('hidden');
    byId('searchResults')?.classList.add('hidden');
    topicView.classList.remove('hidden');
    byId('backBtn')?.classList.remove('hidden');

    const cards = cat.topics.map(topic => `
      <article class="topic-card" data-topic-card="${cat.id}:${topic.id}">
        <div class="topic-card-title">${escapeHtml(topic.title)}</div>
        ${topic.description ? `<div class="topic-card-desc">${escapeHtml(topic.description)}</div>` : ''}
        ${(topic.tags || []).length ? `
          <div class="topic-card-tags">
            ${topic.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
          </div>` : ''}
      </article>
    `).join('');

    topicView.innerHTML = `
      <div class="category-view">
        <div class="category-view-header">
          <span class="category-view-dot" style="background:${cat.color}"></span>
          <h2>${escapeHtml(cat.name)}</h2>
          <span class="category-view-count">${cat.topics.length} tópicos</span>
        </div>
        <div class="topics-grid">${cards}</div>
      </div>
    `;

    topicView.querySelectorAll('[data-topic-card]').forEach(card => {
      card.addEventListener('click', () => {
        const [categoryId, topicId] = card.dataset.topicCard.split(':');
        showTopic(categoryId, topicId);
      });
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showTopic(catId, topicId) {
    const cat = CONTENT.categories.find(category => category.id === catId);
    const topic = cat?.topics.find(item => item.id === topicId);
    const topicView = byId('topicView');
    if (!cat || !topic || !topicView) return;

    byId('welcome')?.classList.add('hidden');
    byId('searchResults')?.classList.add('hidden');
    topicView.classList.remove('hidden');
    byId('backBtn')?.classList.remove('hidden');

    topicView.innerHTML = renderTopic(cat, topic);

    topicView.querySelector('[data-home-link]')?.addEventListener('click', showHome);
    topicView.querySelector('[data-category-link]')?.addEventListener('click', () => showCategory(cat.id));

    topicView.querySelectorAll('.copy-btn').forEach(button => {
      button.addEventListener('click', async () => {
        const text = button.closest('.code-block')?.querySelector('pre')?.textContent || '';
        try {
          await navigator.clipboard.writeText(text);
          button.textContent = '✓ Copiado';
        } catch {
          const area = document.createElement('textarea');
          area.value = text;
          document.body.appendChild(area);
          area.select();
          document.execCommand('copy');
          area.remove();
          button.textContent = '✓ Copiado';
        }
        setTimeout(() => button.textContent = 'Copiar', 1600);
      });
    });

    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.topicId === topicId);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function buildCards() {
    const container = byId('welcomeCards');
    if (!container) return;

    container.innerHTML = '';

    CONTENT.categories.forEach(cat => {
      const card = document.createElement('article');
      card.className = 'welcome-card';
      card.innerHTML = `
        <div class="welcome-card-top">
          <div class="welcome-card-dot" style="background:${cat.color}"></div>
          <span class="welcome-card-count">${cat.topics.length} tópicos</span>
        </div>
        <h3>${escapeHtml(cat.name)}</h3>
        <p class="welcome-card-description">${descriptions[cat.id] || ''}</p>
        <button class="welcome-card-action" type="button">Acessar comandos →</button>
      `;

      card.addEventListener('click', () => showCategory(cat.id));
      card.querySelector('.welcome-card-action')?.addEventListener('click', event => {
        event.stopPropagation();
        showCategory(cat.id);
      });

      container.appendChild(card);
    });
  }

  function buildMenu() {
    const nav = byId('nav');
    if (!nav) return;

    nav.innerHTML = '';

    CONTENT.categories.forEach(cat => {
      const category = document.createElement('section');
      category.className = 'nav-category collapsed';

      const header = document.createElement('button');
      header.type = 'button';
      header.className = 'nav-category-header';
      header.innerHTML = `
        <span class="nav-dot" style="background:${cat.color}"></span>
        <span class="nav-category-label">${escapeHtml(cat.name)}</span>
        <span class="nav-chevron">▼</span>
      `;

      const items = document.createElement('div');
      items.className = 'nav-items';

      cat.topics.forEach(topic => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'nav-item';
        item.dataset.topicId = topic.id;
        item.textContent = topic.title;
        item.addEventListener('click', event => {
          event.stopPropagation();
          showTopic(cat.id, topic.id);
        });
        items.appendChild(item);
      });

      header.addEventListener('click', () => {
        const opening = category.classList.contains('collapsed');
        category.classList.toggle('collapsed');
        if (opening) showCategory(cat.id);
      });

      category.append(header, items);
      nav.appendChild(category);
    });
  }

  function bindGlobalControls() {
    byId('backBtn')?.addEventListener('click', showHome);

    byId('portalBrandHome')?.addEventListener('click', showHome);

    byId('heroStartButton')?.addEventListener('click', () => {
      byId('databasePlatforms')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  function startRecovery() {
    if (typeof CONTENT === 'undefined' || !Array.isArray(CONTENT.categories)) {
      console.error('DBATOOLKIT: CONTENT não foi carregado.');
      return;
    }

    buildMenu();
    buildCards();
    bindGlobalControls();

    document.documentElement.dataset.dbatoolkitReady = 'true';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startRecovery, { once: true });
  } else {
    startRecovery();
  }
})();
