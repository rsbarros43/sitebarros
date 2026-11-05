# barros.inf.br — v4 (Blog + Currículo)

Site pessoal de Renato Barros: **blog, artigos, projetos e currículo**, gerado com [Eleventy (11ty)](https://www.11ty.dev/) e publicado no GitHub Pages pelo GitHub Actions.

## Estrutura do menu

| Menu | Endereço | Origem |
|---|---|---|
| Início | `/` | `src/index.njk` |
| Sobre mim | `/sobre/` | `src/sobre.njk` |
| Blog | `/blog/` | posts com `tipo: blog` |
| Artigos | `/artigos/` | posts com `tipo: artigo` |
| Projetos | `/projetos/` | `src/_data/projetos.json` |
| Currículo | `/curriculo/` e `/en/curriculum/` | `src/_data/cv.json` |
| Contato | `/contato/` | `src/contato.njk` |

Também são geradas automaticamente: `/categorias/`, `/tags/`, `/arquivo/`, `/busca/` (Ctrl+K em qualquer página), `/feed.xml` (RSS), `/sitemap.xml` e `/404.html`.

## Publicar um post

1. Crie o arquivo:
   ```bash
   npm run novo-post -- "Título do post"            # post de blog
   npm run novo-post -- "Título do artigo" artigo   # artigo
   ```
   Ou crie à mão em `src/posts/AAAA-MM-DD-nome-do-post.md`.
2. Preencha o cabeçalho:
   ```yaml
   ---
   title: "Título"
   descricao: "Resumo curto (cards, busca, LinkedIn)"
   tipo: blog            # ou artigo
   categoria: Data Guard # uma categoria
   tags: [oracle, rman]  # várias tags
   capa: /assets/img/minha-capa.jpg   # opcional — sem capa, é gerada uma automática
   rascunho: true        # opcional — não publica enquanto estiver true
   ---
   ```
3. Escreva em Markdown. Use `## Subtítulos` (3 ou mais geram o sumário lateral) e blocos ` ```sql `, ` ```bash `, ` ```plaintext `.
4. `git add . && git commit -m "Novo post" && git push` — o site é publicado sozinho em ~1 minuto.

## Rodar localmente

```bash
npm install
npm start        # http://localhost:8080 (mostra rascunhos, recarrega ao salvar)
npm run build    # gera a pasta _site/
```

## Onde editar cada coisa

- **Seus dados (nome, e-mail, redes, menu):** `src/_data/site.json`
- **Currículo PT/EN:** `src/_data/cv.json` (os PDFs ficam em `static/`)
- **Projetos:** `src/_data/projetos.json` — `destaque: true` aparece na página inicial
- **Texto do "Sobre mim":** `src/sobre.njk`
- **Visual (cores, fontes):** `src/assets/css/main.css` (variáveis no topo)
- **Projetos antigos, PDFs, imagens, CNAME:** pasta `static/` — tudo é copiado como está para a raiz do site, então os endereços antigos (`/DBATOOLKIT/`, `/OracleGoldenGateEnterpriseAcademy/`…) continuam funcionando.

## Configuração única no GitHub (primeira vez)

No repositório: **Settings → Pages → Build and deployment → Source: "GitHub Actions"**.
O domínio `barros.inf.br` continua configurado pelo arquivo `static/CNAME`.

O antigo `index-en.html` agora redireciona para `/en/curriculum/`.
