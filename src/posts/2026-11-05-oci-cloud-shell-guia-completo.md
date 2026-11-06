---
title: "OCI Cloud Shell na prática: o terminal Linux que já vem pronto dentro da Oracle Cloud"
descricao: "Guia passo a passo, com telas, do OCI Cloud Shell: como abrir, o que vem instalado, comandos Linux e OCI CLI para o dia a dia do DBA, transferência de arquivos, limites e um desafio prático."
tipo: blog
categoria: OCI
tags: [oci, cloud shell, oci cli, linux, cloud]
---

Quem administra banco na **Oracle Cloud Infrastructure (OCI)** conhece a rotina: abrir o console, clicar em vários menus, esperar a página carregar, copiar um OCID, abrir outro menu… Para muita coisa existe um caminho bem mais rápido — e ele já está dentro do próprio console, sem instalar nada: o **OCI Cloud Shell**.

Neste post eu mostro, tela por tela, como usar o Cloud Shell desde o primeiro acesso até tarefas reais de DBA: inventário de recursos, consultas com a OCI CLI, envio de arquivos para o Object Storage e automação com scripts.

> **Resumo para quem tem pressa:** o Cloud Shell é um terminal Linux gratuito, aberto pelo navegador, já autenticado com o seu usuário do console e com a OCI CLI, Python, Git, Ansible e Terraform instalados. Tem 5 GB de home persistente e encerra a sessão após um período sem uso.

## O que é o Cloud Shell, exatamente?

O Cloud Shell é uma **pequena máquina Linux gerenciada pela Oracle**, criada sob demanda para o seu usuário e acessada por uma janela de terminal no rodapé do console. Os pontos que fazem diferença no dia a dia:

- **Não precisa configurar nada.** Não há chave de API, arquivo `~/.oci/config` ou fingerprint para cadastrar: a OCI CLI já usa a identidade de quem está logado no console.
- **Respeita as suas permissões.** Tudo o que você executa passa pelas mesmas políticas do IAM. Se você não pode apagar um bucket pelo console, também não pode pelo Cloud Shell.
- **Tem um diretório home persistente.** O que você grava em `$HOME` continua lá na próxima sessão — scripts, anotações, arquivos de configuração.
- **É gratuito.** O uso do Cloud Shell não é cobrado; você paga apenas pelos recursos que criar com ele (uma instância, um bucket com dados etc.).
- **Já vem com ferramentas.** OCI CLI, Python 3, Java, Git, Ansible, Terraform, `kubectl`, `helm`, editores (`vim`, `nano`) e utilitários comuns de Linux.

Pense nele como um **"jump server" descartável**, sempre atualizado, que você não precisa manter.

## Pré-requisitos

1. Um usuário com acesso ao **console da OCI**.
2. Permissão de IAM para usar o Cloud Shell. Administradores da tenancy já têm; para os demais grupos, o administrador precisa criar uma política como:

```plaintext
Allow group DBAs to use cloud-shell in tenancy
```

3. Um navegador moderno (Chrome, Edge, Firefox ou Safari).

## Passo 1 — Abrindo o Cloud Shell

No canto superior direito do console há o ícone de **ferramentas do desenvolvedor** (`>_`). Clique nele e escolha **Cloud Shell**.

<figure>
  <img src="/assets/img/posts/oci-cloud-shell/01-console-menu-cloud-shell.png" alt="Ícone de ferramentas do desenvolvedor no console da OCI com a opção Cloud Shell" loading="lazy">
  <figcaption>Tela 1 — O atalho do Cloud Shell no cabeçalho do console da OCI.</figcaption>
</figure>

Na primeira vez, a OCI provisiona o ambiente e cria o seu diretório home — isso leva alguns segundos. Nas próximas vezes a abertura é bem mais rápida.

<figure>
  <img src="/assets/img/posts/oci-cloud-shell/02-cloud-shell-aberto.png" alt="Janela do Cloud Shell aberta no rodapé do console da OCI" loading="lazy">
  <figcaption>Tela 2 — O terminal aberto no rodapé do console, já com o prompt pronto para uso.</figcaption>
</figure>

### Conhecendo a janela

A barra superior do Cloud Shell tem alguns controles que vale conhecer logo de início:

- **Minimizar / restaurar / maximizar** — maximize para trabalhar com mais espaço; minimize para voltar ao console sem fechar a sessão.
- **Menu de engrenagem (ações)** — enviar arquivos (*Upload*), baixar arquivos (*Download*), escolher a **arquitetura** (x86_64 ou Arm/Ampere), configurar **rede** e reiniciar o ambiente.
- **Fechar** — encerra a janela (o conteúdo do home continua salvo).

<figure>
  <img src="/assets/img/posts/oci-cloud-shell/03-menu-acoes.png" alt="Menu de ações do Cloud Shell com opções de upload, download, arquitetura e rede" loading="lazy">
  <figcaption>Tela 3 — O menu de ações: upload, download, arquitetura e configuração de rede.</figcaption>
</figure>

> O Cloud Shell trabalha no contexto da **região selecionada no console**. Se você trocar de região no topo da página, a sessão passa a apontar para a nova região.

## Passo 2 — Reconhecendo o ambiente com comandos Linux

Antes de usar a OCI CLI, vale entender **onde** você está. São comandos simples, mas que respondem perguntas importantes.

### Quem sou eu?

```bash
whoami
```

O retorno é o seu usuário Linux dentro do Cloud Shell — normalmente derivado do nome do seu usuário do console. No meu caso, `barros`.

<figure>
  <img src="/assets/img/posts/oci-cloud-shell/04-whoami.png" alt="Saída do comando whoami no Cloud Shell" loading="lazy">
  <figcaption>Tela 4 — O usuário Linux da sessão.</figcaption>
</figure>

### Onde estou?

```bash
pwd
echo $HOME
```

Você começa sempre no seu diretório home, que é justamente a área **persistente**. Tudo fora dele (como `/tmp`) é descartado quando o ambiente é recriado.

<figure>
  <img src="/assets/img/posts/oci-cloud-shell/05-pwd.png" alt="Saída do comando pwd mostrando o diretório home" loading="lazy">
  <figcaption>Tela 5 — O diretório atual: o home persistente do usuário.</figcaption>
</figure>

### Qual sistema operacional?

```bash
cat /etc/os-release
```

O Cloud Shell roda sobre **Oracle Linux**. Saber a versão ajuda quando você for instalar pacotes ou seguir alguma documentação específica.

<figure>
  <img src="/assets/img/posts/oci-cloud-shell/06-os-release.png" alt="Saída do comando cat /etc/os-release" loading="lazy">
  <figcaption>Tela 6 — Distribuição e versão do sistema operacional.</figcaption>
</figure>

### Qual arquitetura de processador?

```bash
uname -m
```

- `x86_64` → processadores Intel/AMD;
- `aarch64` → processadores Arm (Ampere).

Isso importa quando você baixa binários: um executável para x86_64 não roda em Arm e vice-versa. A arquitetura pode ser trocada no menu de ações (Tela 3).

<figure>
  <img src="/assets/img/posts/oci-cloud-shell/07-uname.png" alt="Saída do comando uname -m" loading="lazy">
  <figcaption>Tela 7 — A arquitetura do processador do ambiente.</figcaption>
</figure>

### Quanto espaço eu tenho?

```bash
df -h $HOME
du -sh $HOME
```

O primeiro mostra o tamanho total da área persistente (cerca de **5 GB**); o segundo, quanto você já ocupou.

### Variáveis de ambiente da OCI

O Cloud Shell já exporta variáveis com informações da sua sessão. Para ver todas:

```bash
env | grep -i ^oci
```

Duas delas são muito úteis em scripts: `OCI_TENANCY` (o OCID da tenancy) e `OCI_REGION` (a região atual).

## Passo 3 — Persistência na prática: criando um laboratório

Vamos provar que o home é persistente criando uma pasta de laboratório e um arquivo:

```bash
mkdir -p ~/lab-cloudshell
cd ~/lab-cloudshell
echo "Laboratório Cloud Shell criado em $(date '+%d/%m/%Y %H:%M') por $(whoami)" > teste.txt
ls -l
```

<figure>
  <img src="/assets/img/posts/oci-cloud-shell/08-mkdir-lab.png" alt="Criação da pasta de laboratório e do arquivo de teste" loading="lazy">
  <figcaption>Tela 8 — Pasta de laboratório criada no home.</figcaption>
</figure>

Agora leia o conteúdo:

```bash
cat teste.txt
```

<figure>
  <img src="/assets/img/posts/oci-cloud-shell/09-cat-teste.png" alt="Conteúdo do arquivo teste.txt" loading="lazy">
  <figcaption>Tela 9 — O arquivo de teste com data, hora e usuário.</figcaption>
</figure>

Feche o Cloud Shell, abra de novo e rode `cat ~/lab-cloudshell/teste.txt`: o arquivo continua lá. É aqui que você vai guardar seus scripts do dia a dia.

## Passo 4 — Primeiros comandos da OCI CLI

A OCI CLI é o comando `oci`. Toda a API da Oracle Cloud está disponível por ele — o que você faz no console, você faz (mais rápido e de forma repetível) pela linha de comando.

### Versão instalada

```bash
oci --version
```

A Oracle mantém a CLI do Cloud Shell atualizada, então você não precisa se preocupar com upgrade.

<figure>
  <img src="/assets/img/posts/oci-cloud-shell/10-oci-version.png" alt="Saída do comando oci --version" loading="lazy">
  <figcaption>Tela 10 — Versão da OCI CLI disponível no ambiente.</figcaption>
</figure>

### Namespace do Object Storage

```bash
oci os ns get
```

O **namespace** é um identificador único da tenancy no Object Storage. Ele aparece nas URLs dos buckets e é pedido em muitos comandos (por exemplo, para configurar backups RMAN para o Object Storage).

<figure>
  <img src="/assets/img/posts/oci-cloud-shell/11-oci-os-ns-get.png" alt="Saída JSON do comando oci os ns get" loading="lazy">
  <figcaption>Tela 11 — O namespace da tenancy, retornado em JSON.</figcaption>
</figure>

> Repare que a resposta veio sem pedir nenhuma credencial. É a autenticação automática do Cloud Shell funcionando.

### Regiões disponíveis

```bash
oci iam region list --output table
```

### Listando compartimentos

Compartimentos organizam os recursos da tenancy (por ambiente, projeto, área…). Para listar **todos**, inclusive os aninhados, mostrando só nome e estado:

```bash
oci iam compartment list \
  --compartment-id "$OCI_TENANCY" \
  --compartment-id-in-subtree true \
  --all \
  --query 'data[].{Nome:name, Estado:"lifecycle-state"}' \
  --output table
```

Detalhando cada parâmetro:

- `--compartment-id "$OCI_TENANCY"` — começa a busca pela raiz (a tenancy).
- `--compartment-id-in-subtree true` — desce por todos os níveis.
- `--all` — busca todas as páginas de resultado (sem isso, a CLI pode trazer só a primeira página).
- `--query` — filtro **JMESPath**: escolhe quais campos exibir e com que nome.
- `--output table` — formata como tabela, bem mais legível que JSON.

<figure>
  <img src="/assets/img/posts/oci-cloud-shell/12-compartment-list.png" alt="Lista de compartimentos em formato de tabela" loading="lazy">
  <figcaption>Tela 12 — Compartimentos da tenancy em formato de tabela.</figcaption>
</figure>

Guarde o OCID de um compartimento em uma variável para reaproveitar nos próximos comandos:

```bash
export COMP_ID=$(oci iam compartment list \
  --compartment-id "$OCI_TENANCY" --compartment-id-in-subtree true --all \
  --query "data[?name=='NOME_DO_COMPARTIMENTO'].id | [0]" --raw-output)

echo $COMP_ID
```

### Listando instâncias de Compute

```bash
oci compute instance list \
  --compartment-id "$COMP_ID" \
  --all \
  --query 'data[].{Nome:"display-name", Estado:"lifecycle-state", Shape:shape, AD:"availability-domain"}' \
  --output table
```

<figure>
  <img src="/assets/img/posts/oci-cloud-shell/13-instance-list.png" alt="Lista de instâncias de compute em formato de tabela" loading="lazy">
  <figcaption>Tela 13 — Instâncias do compartimento, com estado e shape.</figcaption>
</figure>

Quer só as que estão **rodando**? Adicione `--lifecycle-state RUNNING`.

## Passo 5 — Comandos que todo DBA vai querer ter à mão

### Bancos de dados (DB Systems, Exadata e Autonomous)

```bash
# DB Systems (VM/BM)
oci db system list --compartment-id "$COMP_ID" --all \
  --query 'data[].{Nome:"display-name", Estado:"lifecycle-state", Shape:shape, Versao:version}' --output table

# Databases dentro de um DB Home
oci db database list --compartment-id "$COMP_ID" --db-home-id <OCID_DO_DB_HOME> --output table

# VM Clusters de Exadata Cloud
oci db cloud-vm-cluster list --compartment-id "$COMP_ID" --all \
  --query 'data[].{Nome:"display-name", Estado:"lifecycle-state", CPUs:"cpu-core-count"}' --output table

# Autonomous Databases
oci db autonomous-database list --compartment-id "$COMP_ID" --all \
  --query 'data[].{Nome:"display-name", Estado:"lifecycle-state", Carga:"db-workload", OCPUs:"compute-count"}' --output table
```

### Backups

```bash
oci db backup list --compartment-id "$COMP_ID" --all \
  --query 'data[].{Nome:"display-name", Tipo:type, Estado:"lifecycle-state", Inicio:"time-started"}' --output table
```

### Object Storage

```bash
# Listar buckets
oci os bucket list --compartment-id "$COMP_ID" --query 'data[].name' --output table

# Criar um bucket de laboratório
oci os bucket create --compartment-id "$COMP_ID" --name lab-cloudshell

# Enviar um arquivo
oci os object put --bucket-name lab-cloudshell --file ~/lab-cloudshell/teste.txt

# Listar objetos do bucket
oci os object list --bucket-name lab-cloudshell --output table

# Baixar de volta
oci os object get --bucket-name lab-cloudshell --name teste.txt --file /tmp/teste-baixado.txt
```

<figure>
  <img src="/assets/img/posts/oci-cloud-shell/14-object-storage.png" alt="Envio de arquivo para o Object Storage e listagem do bucket" loading="lazy">
  <figcaption>Tela 14 — Arquivo enviado e listado no bucket de laboratório.</figcaption>
</figure>

### Ligar e desligar uma instância

```bash
oci compute instance action --instance-id <OCID_DA_INSTANCIA> --action STOP
oci compute instance action --instance-id <OCID_DA_INSTANCIA> --action START
```

> ⚠️ Comandos de ação (`STOP`, `delete`, `terminate`) não pedem a mesma confirmação visual do console. Confira o OCID e o compartimento antes de pressionar Enter.

## Passo 6 — Enviando e baixando arquivos

Pelo **menu de ações** (Tela 3):

- **Upload** — envia um arquivo do seu computador para o home do Cloud Shell. Útil para subir um script `.sql`, um `.sh` ou um arquivo de parâmetros.
- **Download** — informe o caminho do arquivo no Cloud Shell (ex.: `lab-cloudshell/teste.txt`) e o navegador faz o download.

<figure>
  <img src="/assets/img/posts/oci-cloud-shell/15-upload-download.png" alt="Janela de upload de arquivos do Cloud Shell" loading="lazy">
  <figcaption>Tela 15 — Envio de arquivos do computador local para o Cloud Shell.</figcaption>
</figure>

Para arquivos grandes, o melhor caminho costuma ser o **Object Storage**: envie para um bucket e baixe de lá, pelo console ou por uma URL pré-autenticada (PAR).

## Passo 7 — Automatizando: um script de inventário

Juntando tudo, um script simples que gera um inventário do compartimento em um arquivo:

```bash
cat > ~/lab-cloudshell/inventario.sh <<'EOF'
#!/bin/bash
# Inventário rápido de um compartimento da OCI
COMP_ID="$1"
SAIDA=~/lab-cloudshell/inventario_$(date +%Y%m%d_%H%M).txt

if [ -z "$COMP_ID" ]; then
  echo "Uso: $0 <OCID_DO_COMPARTIMENTO>"; exit 1
fi

{
  echo "== Inventário gerado em $(date) | Região: $OCI_REGION =="
  echo; echo "## Instâncias"
  oci compute instance list --compartment-id "$COMP_ID" --all \
    --query 'data[].{Nome:"display-name", Estado:"lifecycle-state", Shape:shape}' --output table
  echo; echo "## DB Systems"
  oci db system list --compartment-id "$COMP_ID" --all \
    --query 'data[].{Nome:"display-name", Estado:"lifecycle-state", Versao:version}' --output table
  echo; echo "## Autonomous Databases"
  oci db autonomous-database list --compartment-id "$COMP_ID" --all \
    --query 'data[].{Nome:"display-name", Estado:"lifecycle-state"}' --output table
  echo; echo "## Buckets"
  oci os bucket list --compartment-id "$COMP_ID" --query 'data[].name' --output table
} > "$SAIDA" 2>&1

echo "Inventário salvo em $SAIDA"
EOF

chmod +x ~/lab-cloudshell/inventario.sh
~/lab-cloudshell/inventario.sh "$COMP_ID"
```

<figure>
  <img src="/assets/img/posts/oci-cloud-shell/16-script-inventario.png" alt="Execução do script de inventário no Cloud Shell" loading="lazy">
  <figcaption>Tela 16 — Script de inventário executado e arquivo gerado no home.</figcaption>
</figure>

Como o script está no home persistente, ele estará lá amanhã — e pode ser baixado pelo menu de ações ou versionado com Git.

## Limitações que você precisa conhecer

| Ponto | O que saber |
|---|---|
| **Armazenamento** | Cerca de 5 GB persistentes no home. Fora do home, nada sobrevive à recriação do ambiente. |
| **Inatividade** | A sessão é encerrada após um período sem uso, e há um tempo máximo por sessão. Para tarefas longas, use uma instância ou um job agendado. |
| **Home esquecido** | Se o Cloud Shell ficar meses sem uso, o diretório home pode ser removido. Não use como único lugar para guardar scripts importantes. |
| **Permissões** | Vale tudo o que o IAM do seu usuário permite — nem mais, nem menos. |
| **Região** | O contexto acompanha a região selecionada no console. Confira antes de executar comandos. |
| **Rede** | Por padrão, o Cloud Shell sai pela rede pública da Oracle e **não enxerga** recursos em subnets privadas. Para isso existe a opção de **rede privada** no menu de ações, apontando para uma subnet da sua VCN (exige configuração de IAM e rede). |
| **Não é servidor** | Não use para serviços permanentes, processos em background longos ou cargas pesadas. |

## Onde o Cloud Shell brilha para o DBA

- **Inventário rápido** — quantas instâncias, DB Systems, VM Clusters e Autonomous existem, e em que estado, em segundos.
- **Object Storage** — criar buckets, subir e baixar arquivos, conferir backups e exports (Data Pump) armazenados.
- **Scripts e automação** — testar comandos da CLI antes de levá-los para um job ou pipeline.
- **Ações operacionais** — ligar/desligar ambientes de teste fora do horário, por exemplo.
- **Estudo e laboratório** — praticar OCI CLI, Terraform e Ansible sem instalar nada na sua máquina.
- **Acesso de emergência** — quando você está em uma máquina sem as ferramentas instaladas, basta um navegador.

## Desafio prático

Para fixar, tente fazer sozinho no seu Cloud Shell:

1. Descobrir o **namespace** da sua tenancy.
2. Listar **todos os compartimentos** em tabela, mostrando nome e estado.
3. Listar as **instâncias em execução** de um compartimento.
4. Criar um bucket `lab-<seu-nome>`, enviar um arquivo para ele e listar o conteúdo.
5. Salvar todos esses comandos em um script no home e executá-lo de novo no dia seguinte.
6. **Limpeza:** apagar o objeto e o bucket de laboratório:

```bash
oci os object delete --bucket-name lab-cloudshell --object-name teste.txt --force
oci os bucket delete --bucket-name lab-cloudshell --force
```

## Conclusão

O Cloud Shell é daquelas ferramentas que, depois que você começa a usar, não larga mais. Ele elimina a etapa de configurar a CLI, respeita as permissões do IAM, guarda seus scripts e está sempre a um clique de distância no console.

Minha sugestão: na próxima vez que for fazer algo repetitivo no console — conferir o estado dos bancos, procurar um OCID, listar backups —, faça pelo Cloud Shell. Em pouco tempo você terá uma coleção de scripts que economiza horas.

## Referências

- [Documentação oficial do OCI Cloud Shell](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/cloudshellintro.htm)
- [Referência de comandos da OCI CLI](https://docs.oracle.com/en-us/iaas/tools/oci-cli/latest/oci_cli_docs/)
- Leitura recomendada: [OCI Cloud Shell — um terminal Linux na nuvem pronto para trabalhar (Douglas Paiva)](https://douglaspaiva.me/oci-cloud-shell-um-terminal-linux-na-nuvem-pronto-para-trabalhar-voce-ja-usou/)
