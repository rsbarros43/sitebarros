# NOVOPROJETO v3.2.0 — Admin Preview

Esta versão altera somente a área **Admin**. Todo o portal público foi preservado.

## Acesso

1. Abra o portal.
2. Clique em **Admin**.
3. Use a senha:

```text
DBATOOLKIT
```

## Painel disponível

- Dashboard com métricas reais;
- gerenciamento e pesquisa dos 35 tópicos;
- formulário de novo tópico;
- rascunhos salvos no navegador;
- perfil profissional;
- exportação de conteúdo e rascunhos;
- configurações de validação.

## Executar

```bash
chmod +x iniciar-dbtoolkit.sh
./iniciar-dbtoolkit.sh
```

Abra:

```text
http://localhost:8097/?v=320
```


## v3.2.3 — B&B Enterprise Footer

Rodapé institucional incluído no final do conteúdo principal, sem ocupar a barra lateral.

Inclui:

- Desenvolvido por Renato Barros;
- Barros & Barros Consultoria e Suporte;
- especialidades com ícones;
- Network/Security;
- Multi-Cloud Technologies;
- texto institucional;
- copyright.

A identificação “Enterprise Edition” não é exibida.


## v4.0.0 — Interactive Enterprise Command Simulator

Cada bloco de comando passa a exibir o botão **Abrir Terminal**.

O terminal:

- adapta o prompt para Oracle, SQL Server, PostgreSQL ou MySQL;
- apresenta ambiente, host, banco e sessão fictícios;
- simula execução em modo somente leitura;
- gera resultados coerentes com o comando;
- apresenta tabelas, tempo, quantidade de linhas e status;
- oferece Executar, Executar novamente, Limpar e Copiar comando.

Nenhum comando é enviado para um banco real.


## v4.0.1 — Terminais com saída nativa

O resultado do simulador deixou de usar tabelas visuais de dashboard.

Agora cada tecnologia apresenta saída monoespaçada semelhante ao cliente real:

- Oracle SQL*Plus;
- SQL Server sqlcmd;
- PostgreSQL psql;
- MySQL Client.

Inclui cabeçalhos, separadores, alinhamento fixo, mensagens de quantidade de linhas
e retorno ao prompt após a execução.


## v4.0.2 — Final Clean Enterprise Release

Revisão completa de identidade antes da publicação no GitHub Pages:

- remoção de referências de identidade legada;
- remoção de referências da empresa anterior;
- URL oficial do projeto atualizada;
- portal institucional definido como `https://barros.inf.br/`;
- e-mail atualizado para `renato.barros@barros.inf.br`;
- metadados Open Graph, canonical e JSON-LD revisados;
- terminais realistas, Admin e rodapé B&B preservados.
