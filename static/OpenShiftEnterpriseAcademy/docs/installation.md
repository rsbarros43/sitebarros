# Instalação do OpenShift Local (CRC)

Guia resumido de instalação. Para o passo a passo explicado com contexto, veja os [Capítulos 02 e 03](../chapters/02-pre-requisitos.html).

## Download

Baixe o binário e o pull secret na página oficial da Red Hat:
**https://console.redhat.com/openshift/create/local**

É necessária uma conta gratuita Red Hat Developer.

## Linux

```bash
tar -xvf crc-linux-amd64.tar.xz
sudo mv crc-linux-*-amd64/crc /usr/local/bin/
crc setup
crc start -p pull-secret.txt
eval $(crc oc-env)
```

## macOS (Intel ou Apple Silicon)

```bash
# Execute o instalador .pkg baixado — ele já configura o PATH.
crc setup
crc start -p pull-secret.txt
eval $(crc oc-env)
```

## Windows (PowerShell)

```powershell
# Execute o instalador .msi baixado — ele já configura o PATH.
crc setup
crc start -p pull-secret.txt
& crc oc-env | Invoke-Expression
```

## Requisitos mínimos (qualquer sistema operacional)

| Recurso | Mínimo | Recomendado para estudo |
|---|---|---|
| vCPU | 4 | 8 |
| RAM | 9 GB | 24–32 GB |
| Disco livre | 35 GB | 120 GB |

## Verificando a instalação

```bash
crc status
oc whoami
oc get projects
```

Se os três comandos rodarem sem erro, o cluster está pronto para os laboratórios.
