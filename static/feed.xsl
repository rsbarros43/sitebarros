<?xml version="1.0" encoding="utf-8"?>
<!-- Deixa o feed RSS (feed.xml) legível quando aberto no navegador -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" encoding="utf-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width,initial-scale=1"/>
        <title>Feed RSS — <xsl:value-of select="atom:feed/atom:title"/></title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml"/>
        <style>
          body{margin:0;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;background:#08121f;color:#e8eef5;line-height:1.6}
          .c{width:min(780px,calc(100% - 32px));margin:auto;padding:40px 0 60px}
          a{color:#2fbf6a;text-decoration:none}a:hover{color:#3fd57c}
          .aviso{background:#0e1b2c;border:1px solid #2a4360;border-radius:14px;padding:20px 22px;margin-bottom:32px}
          .aviso strong{color:#fff}.aviso p{margin:6px 0 0;color:#9badc1}
          code{font-family:"JetBrains Mono",Consolas,monospace;background:#12233a;padding:2px 6px;border-radius:5px;color:#fff;font-size:.9em}
          h1{font-size:2rem;margin:0 0 4px;color:#fff;letter-spacing:-.02em}
          .sub{color:#9badc1;margin:0 0 28px}
          .item{padding:18px 0;border-top:1px solid #1d3046}
          .item h2{font-size:1.15rem;margin:0 0 4px}
          .item small{color:#9badc1;font-family:"JetBrains Mono",Consolas,monospace;font-size:.8rem}
          .voltar{display:inline-block;margin-bottom:24px;font-weight:600}
        </style>
      </head>
      <body>
        <div class="c">
          <a class="voltar" href="/">← Voltar para o site</a>
          <div class="aviso">
            <strong>📡 Este é o feed RSS do blog.</strong>
            <p>Para receber os novos posts automaticamente, copie este endereço e cole no seu leitor de RSS (Feedly, Inoreader, Outlook, Thunderbird…):</p>
            <p><code>https://barros.inf.br/feed.xml</code></p>
          </div>
          <h1><xsl:value-of select="atom:feed/atom:title"/></h1>
          <p class="sub"><xsl:value-of select="atom:feed/atom:subtitle"/></p>
          <xsl:for-each select="atom:feed/atom:entry">
            <div class="item">
              <h2><a href="{atom:link/@href}"><xsl:value-of select="atom:title"/></a></h2>
              <small><xsl:value-of select="substring(atom:updated, 9, 2)"/>/<xsl:value-of select="substring(atom:updated, 6, 2)"/>/<xsl:value-of select="substring(atom:updated, 1, 4)"/></small>
            </div>
          </xsl:for-each>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
