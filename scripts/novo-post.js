// Uso: npm run novo-post -- "Título do post" [artigo]
import fs from "node:fs";
const titulo = process.argv[2];
const tipo = process.argv[3] === "artigo" ? "artigo" : "blog";
if (!titulo) { console.log('Uso: npm run novo-post -- "Título do post" [artigo]'); process.exit(1); }
const slug = titulo.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const data = new Date().toISOString().slice(0, 10);
const arquivo = `src/posts/${data}-${slug}.md`;
if (fs.existsSync(arquivo)) { console.log("Já existe:", arquivo); process.exit(1); }
fs.writeFileSync(arquivo, `---
title: "${titulo.replace(/"/g, '\\"')}"
descricao: "Resumo de uma ou duas frases (aparece nos cards, na busca e no LinkedIn)."
tipo: ${tipo}
categoria: Oracle Database
tags: [oracle]
rascunho: true
---

Escreva aqui. Use \`## Subtítulos\` para gerar o sumário automático.

\`\`\`sql
SELECT * FROM v$instance;
\`\`\`
`);
console.log("Criado:", arquivo, "\nRemova 'rascunho: true' quando quiser publicar.");
