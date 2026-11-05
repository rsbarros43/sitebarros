(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const html = document.documentElement;

  /* ---- Tema claro/escuro ---- */
  $("#alternarTema")?.addEventListener("click", () => {
    const novo = html.dataset.tema === "claro" ? "escuro" : "claro";
    html.dataset.tema = novo;
    try { localStorage.setItem("tema", novo); } catch (e) {}
  });

  /* ---- Menu mobile ---- */
  const menu = $("#menu"), menuBtn = $("#abrirMenu");
  menuBtn?.addEventListener("click", () => {
    const aberto = menu.classList.toggle("aberto");
    menuBtn.setAttribute("aria-expanded", aberto);
  });
  menu?.addEventListener("click", (e) => { if (e.target.tagName === "A") menu.classList.remove("aberto"); });

  /* ---- Barra de progresso de leitura ---- */
  const prog = $("#progresso");
  if (prog) {
    const atualizar = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      prog.style.width = h > 0 ? (scrollY / h) * 100 + "%" : "0";
    };
    addEventListener("scroll", atualizar, { passive: true });
  }

  /* ---- Botão copiar nos blocos de código ---- */
  $$("pre[class*='language-']").forEach((pre) => {
    const lang = (pre.className.match(/language-(\w+)/) || [])[1];
    if (lang) pre.dataset.lang = (lang === "text" || lang === "plaintext") ? "" : lang;
    const wrap = document.createElement("div");
    wrap.className = "codigo-wrap";
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copiar-codigo";
    btn.textContent = "Copiar";
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(pre.innerText);
        btn.textContent = "Copiado ✓";
      } catch (e) { btn.textContent = "Erro"; }
      setTimeout(() => (btn.textContent = "Copiar"), 1600);
    });
    wrap.appendChild(btn);
  });

  /* ---- Copiar link do post ---- */
  $$(".copiar-link").forEach((b) =>
    b.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(b.dataset.url); b.textContent = "Link copiado ✓"; } catch (e) {}
      setTimeout(() => (b.textContent = "Copiar link"), 1800);
    })
  );

  /* ---- Sumário: destaca a seção atual ---- */
  const tocLinks = $$(".toc-fixo a");
  if (tocLinks.length && "IntersectionObserver" in window) {
    const mapa = new Map(tocLinks.map((a) => [decodeURIComponent(a.hash.slice(1)), a]));
    const obs = new IntersectionObserver((ents) => {
      ents.forEach((en) => {
        if (en.isIntersecting) {
          tocLinks.forEach((a) => a.classList.remove("ativo"));
          mapa.get(en.target.id)?.classList.add("ativo");
        }
      });
    }, { rootMargin: "-90px 0px -70% 0px" });
    mapa.forEach((_, id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
  }

  /* ---- Filtro de projetos ---- */
  const filtros = $$(".filtro");
  filtros.forEach((f) =>
    f.addEventListener("click", () => {
      filtros.forEach((x) => x.classList.toggle("ativo", x === f));
      $$(".projeto-item").forEach((it) => (it.hidden = f.dataset.filtro !== "todos" && it.dataset.tipo !== f.dataset.filtro));
    })
  );

  /* ---- Impressão: abre todas as experiências ---- */
  addEventListener("beforeprint", () => $$("details").forEach((d) => (d.dataset.estava = d.open, d.open = true)));
  addEventListener("afterprint", () => $$("details").forEach((d) => (d.open = d.dataset.estava === "true")));

  /* ---- Busca ---- */
  let indice = null;
  const carregar = async () => {
    if (indice) return indice;
    try { indice = await (await fetch("/search.json")).json(); } catch (e) { indice = []; }
    return indice;
  };
  const normalizar = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const escapar = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const marcar = (texto, termos) => {
    let out = escapar(texto);
    termos.forEach((t) => {
      if (t.length < 2) return;
      const re = new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
      out = out.replace(re, "<mark>$1</mark>");
    });
    return out;
  };
  const buscar = (q) => {
    const termos = normalizar(q).split(/\s+/).filter(Boolean);
    if (!termos.length) return [];
    return indice
      .map((p) => {
        const titulo = normalizar(p.titulo), tags = normalizar(p.tags.join(" ") + " " + p.categoria), texto = normalizar(p.resumo + " " + p.texto);
        let score = 0;
        for (const t of termos) {
          const s = (titulo.includes(t) ? 10 : 0) + (tags.includes(t) ? 5 : 0) + (texto.includes(t) ? 1 : 0);
          if (!s) return null;
          score += s;
        }
        return { p, score };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((x) => x.p);
  };
  const renderizar = (lista, q, alvo) => {
    const termos = q.trim().split(/\s+/);
    if (!q.trim()) { alvo.innerHTML = ""; return; }
    if (!lista.length) { alvo.innerHTML = `<li class="busca-nada">Nada encontrado para “${escapar(q)}”.</li>`; return; }
    alvo.innerHTML = lista
      .map((p) => `<li><a href="${p.url}"><strong>${marcar(p.titulo, termos)}</strong><small>${p.tipo === "artigo" ? "Artigo" : "Blog"} · ${escapar(p.categoria)} · ${p.data}</small><p>${marcar(p.resumo, termos)}</p></a></li>`)
      .join("");
  };
  const ligar = (input, alvo) => {
    if (!input) return;
    input.addEventListener("input", async () => { await carregar(); renderizar(buscar(input.value), input.value, alvo); });
    input.addEventListener("keydown", (e) => {
      const links = $$("a", alvo);
      if (!links.length) return;
      let i = links.findIndex((a) => a.classList.contains("ativo"));
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        links[i]?.classList.remove("ativo");
        i = e.key === "ArrowDown" ? (i + 1) % links.length : (i - 1 + links.length) % links.length;
        links[i].classList.add("ativo");
        links[i].scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter") {
        (links[i] || links[0]).click();
      }
    });
  };
  const modal = $("#buscaModal"), modalInput = $("#buscaInput");
  const abrirBusca = () => { modal.hidden = false; modalInput.value = ""; $("#buscaResultados").innerHTML = ""; carregar(); setTimeout(() => modalInput.focus(), 20); };
  const fecharBusca = () => { modal.hidden = true; };
  $$("[data-abrir-busca]").forEach((b) => b.addEventListener("click", abrirBusca));
  modal?.addEventListener("click", (e) => { if (e.target === modal) fecharBusca(); });
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); modal.hidden ? abrirBusca() : fecharBusca(); }
    else if (e.key === "Escape" && !modal.hidden) fecharBusca();
  });
  ligar(modalInput, $("#buscaResultados"));

  const pagInput = $("#buscaPaginaInput");
  if (pagInput) {
    ligar(pagInput, $("#buscaPaginaResultados"));
    const q = new URLSearchParams(location.search).get("q");
    if (q) { pagInput.value = q; pagInput.dispatchEvent(new Event("input")); }
  }
})();
