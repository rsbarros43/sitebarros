import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const MESES_CURTOS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const slug = (s) =>
  String(s)
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const stripHtml = (s = "") => String(s).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

export default function (eleventyConfig) {
  // ---- Arquivos estáticos (projetos antigos, PDFs, imagens, CNAME) ----
  eleventyConfig.addPassthroughCopy({ static: "/" });
  eleventyConfig.addPassthroughCopy("src/assets");

  // ---- Rascunhos: "rascunho: true" aparece no npm start, mas não é publicado ----
  eleventyConfig.addPreprocessor("rascunhos", "md", (data) => {
    if (data.rascunho && process.env.ELEVENTY_RUN_MODE === "build") return false;
  });

  // ---- Plugins ----
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/feed.xml",
    stylesheet: "/feed.xsl",
    collection: { name: "feedPosts", limit: 20 },
    metadata: {
      language: "pt-BR",
      title: "Renato Barros — Blog",
      subtitle: "Oracle, Exadata, Cloud e Engenharia de Bancos de Dados",
      base: "https://barros.inf.br/",
      author: { name: "Renato Barros" },
    },
  });

  // ---- Markdown: âncoras nos títulos (para o sumário) ----
  const md = markdownIt({ html: true, linkify: true, typographer: true }).use(markdownItAnchor, {
    slugify: slug,
    level: [2, 3],
    permalink: markdownItAnchor.permalink.headerLink(),
  });
  eleventyConfig.setLibrary("md", md);

  // ---- Coleções ----
  const publicados = (api) =>
    api
      .getFilteredByGlob("src/posts/**/*.md")
      .filter((p) => !(p.data.rascunho && process.env.ELEVENTY_RUN_MODE === "build"))
      .sort((a, b) => b.date - a.date);

  eleventyConfig.addCollection("posts", publicados);
  eleventyConfig.addCollection("feedPosts", (api) => publicados(api).reverse()); // o plugin de feed espera ordem crescente
  eleventyConfig.addCollection("blogPosts", (api) => publicados(api).filter((p) => (p.data.tipo || "blog") === "blog"));
  eleventyConfig.addCollection("artigos", (api) => publicados(api).filter((p) => p.data.tipo === "artigo"));

  const agrupar = (api, campo) => {
    const mapa = new Map();
    for (const post of publicados(api)) {
      let valores = post.data[campo] || [];
      if (!Array.isArray(valores)) valores = [valores];
      for (const v of valores) {
        if (!v || v === "posts") continue;
        const k = slug(v);
        if (!mapa.has(k)) mapa.set(k, { nome: v, slug: k, posts: [] });
        mapa.get(k).posts.push(post);
      }
    }
    return [...mapa.values()].sort((a, b) => b.posts.length - a.posts.length || a.nome.localeCompare(b.nome, "pt-BR"));
  };
  eleventyConfig.addCollection("listaCategorias", (api) => agrupar(api, "categoria"));
  eleventyConfig.addCollection("listaTags", (api) => agrupar(api, "tags"));

  // ---- Filtros ----
  eleventyConfig.addFilter("slug", slug);
  eleventyConfig.addFilter("dataBR", (d) => {
    const dt = new Date(d);
    return `${dt.getUTCDate()} de ${MESES[dt.getUTCMonth()]} de ${dt.getUTCFullYear()}`;
  });
  eleventyConfig.addFilter("dataCurta", (d) => {
    const dt = new Date(d);
    return `${String(dt.getUTCDate()).padStart(2, "0")} ${MESES_CURTOS[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`;
  });
  eleventyConfig.addFilter("ano", (d) => new Date(d).getUTCFullYear());
  eleventyConfig.addFilter("dataISO", (d) => new Date(d).toISOString());
  eleventyConfig.addFilter("tempoLeitura", (html) => {
    const palavras = stripHtml(html).split(" ").filter(Boolean).length;
    return Math.max(1, Math.round(palavras / 200));
  });
  eleventyConfig.addFilter("textoPuro", stripHtml);
  eleventyConfig.addFilter("resumo", (post) => {
    if (post.data.descricao) return post.data.descricao;
    const t = stripHtml(post.content || "");
    return t.length > 200 ? t.slice(0, 200).replace(/\s\S*$/, "") + "…" : t;
  });
  eleventyConfig.addFilter("limitar", (arr, n) => (arr || []).slice(0, n));
  eleventyConfig.addFilter("semPostsTag", (tags) => (tags || []).filter((t) => t !== "posts"));
  eleventyConfig.addFilter("porAno", (posts) => {
    const grupos = {};
    for (const p of posts) (grupos[p.date.getUTCFullYear()] ||= []).push(p);
    return Object.entries(grupos).sort((a, b) => b[0] - a[0]);
  });
  eleventyConfig.addFilter("sumario", (html) => {
    const itens = [];
    const re = /<h([23]) id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
    let m;
    while ((m = re.exec(html))) itens.push({ nivel: Number(m[1]), id: m[2], texto: stripHtml(m[3]) });
    return itens;
  });
  eleventyConfig.addFilter("vizinhos", (colecao, url) => {
    const i = colecao.findIndex((p) => p.url === url);
    return { novo: i > 0 ? colecao[i - 1] : null, antigo: i >= 0 && i < colecao.length - 1 ? colecao[i + 1] : null };
  });
  eleventyConfig.addFilter("relacionados", (colecao, url, n = 3) => {
    const post = colecao.find((p) => p.url === url);
    if (!post) return [];
    const tags = new Set((post.data.tags || []).filter((t) => t !== "posts"));
    return colecao
      .filter((p) => p.url !== post.url)
      .map((p) => ({ p, score: (p.data.tags || []).filter((t) => tags.has(t)).length + (p.data.categoria === post.data.categoria ? 2 : 0) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || b.p.date - a.p.date)
      .slice(0, n)
      .map((x) => x.p);
  });
  eleventyConfig.addFilter("json", (v) => JSON.stringify(v));
  eleventyConfig.addFilter("anoAtual", () => new Date().getFullYear());

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    templateFormats: ["md", "njk"],
    markdownTemplateEngine: false, // não interpreta {{ }} dentro dos posts (código SQL/shell fica intacto)
    htmlTemplateEngine: "njk",
  };
}
