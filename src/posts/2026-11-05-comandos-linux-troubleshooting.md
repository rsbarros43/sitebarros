---
title: "Comandos Linux para troubleshooting: o guia de bolso do DBA"
descricao: "Os comandos que resolvem no dia a dia de servidores Oracle Linux e RHEL — sistema, CPU, memória, disco, rede, serviços, logs, usuários e pacotes — com alertas para o que é destrutivo."
tipo: blog
categoria: Linux
tags: [linux, oracle linux, rhel, troubleshooting, cheat sheet]
---

Depois do [guia de comandos do Windows](/posts/comandos-windows-cmd-powershell-troubleshooting/), a versão que mais uso: **Linux**. O foco aqui é o servidor de banco — Oracle Linux e RHEL 7/8/9 —, mas quase tudo funciona em qualquer distribuição moderna.

> Comandos com `sudo` exigem privilégio de root. Os itens marcados com ⚠️ apagam dados, derrubam serviços ou cortam o acesso ao servidor — confira o host (`hostname`) antes de executar.

## Primeiros 60 segundos em um servidor com problema

Quando alguém diz *"o servidor está lento"*, esta sequência dá o panorama antes de qualquer outra coisa:

```bash
uptime                      # load average (1, 5 e 15 min)
dmesg -T | tail -20         # erros recentes do kernel (OOM, disco, rede)
vmstat 1 5                  # CPU, memória, swap e fila de execução
mpstat -P ALL 1 3           # CPU por núcleo
iostat -xz 1 3              # latência e utilização por disco
free -h                     # memória e swap
sar -n DEV 1 3              # tráfego por interface
top -o %CPU                 # quem está consumindo
```

> `mpstat`, `iostat` e `sar` vêm do pacote **sysstat** (`sudo dnf install sysstat`).

## Sistema

| Comando | O que faz |
|---|---|
| `hostnamectl` | Nome do host, SO, kernel e virtualização |
| `cat /etc/os-release` | Distribuição e versão |
| `uname -r` | Versão do kernel |
| `uptime -p` · `who -b` | Tempo ligado e horário do último boot |
| `lscpu` | CPUs, núcleos, sockets e NUMA |
| `lsblk` | Discos, partições e pontos de montagem em árvore |
| `timedatectl` | Data, fuso e sincronização NTP |
| `chronyc tracking` | Estado da sincronização de horário (importante em RAC) |
| `last -x \| head` | Últimos logins, reboots e shutdowns |

## CPU, memória e processos

| Comando | O que faz |
|---|---|
| `top` / `htop` | Processos em tempo real (`1` mostra CPUs, `M` ordena por memória) |
| `ps -eo pid,user,%cpu,%mem,etime,cmd --sort=-%cpu \| head` | Top 10 por CPU |
| `ps -eo pid,user,rss,cmd --sort=-rss \| head` | Top 10 por memória (RSS em KB) |
| `ps -ef --forest` | Árvore de processos (quem iniciou quem) |
| `pgrep -af pmon` | Processos pelo nome — aqui, os PMON das instâncias Oracle |
| `free -h` | Memória total, usada, cache e swap |
| `cat /proc/meminfo \| grep -i huge` | HugePages configuradas, livres e reservadas |
| `vmstat 1 5` | Coluna `r` alta = fila de CPU; `si/so` > 0 = swap ativo |
| `kill PID` | Pede para o processo terminar (SIGTERM) |
| ⚠️ `kill -9 PID` | Mata o processo à força — **nunca** em processos de background do Oracle |
| `renice +10 -p PID` | Diminui a prioridade de um processo |

Quem foi morto pelo **OOM killer**?

```bash
dmesg -T | grep -i -E "out of memory|killed process"
journalctl -k | grep -i oom
```

## Disco e filesystem

| Comando | O que faz |
|---|---|
| `df -hT` | Espaço por filesystem, com o tipo |
| `df -i` | Inodes — o disco pode "encher" com espaço livre |
| `du -xh --max-depth=1 /u01 \| sort -h` | Quanto ocupa cada subpasta, sem cruzar filesystems |
| `find /u01 -xdev -type f -size +1G -exec ls -lh {} \;` | Arquivos com mais de 1 GB |
| `lsof +L1` | Arquivos **apagados** mas ainda abertos (espaço não liberado) |
| `iostat -xz 1` | `await` = latência (ms); `%util` próximo de 100 = disco saturado |
| `iotop -o` | Processos que estão fazendo I/O agora |
| `mount \| column -t` | Filesystems montados e opções |
| `findmnt` | Idem, em árvore |
| `pvs` · `vgs` · `lvs` | Volumes físicos, grupos e lógicos do LVM |
| ⚠️ `find /u01/app/oracle/diag -name "*.trc" -mtime +30 -delete` | Apaga traces com mais de 30 dias — teste antes **sem** o `-delete` |
| ⚠️ `> arquivo.log` | Zera um log em uso sem apagar o arquivo (libera espaço na hora) |

> O clássico do DBA: `df` mostra disco cheio, `du` não encontra nada. Quase sempre é um log apagado com o processo ainda aberto — o `lsof +L1` mostra quem é. Zere o arquivo pelo `/proc/<PID>/fd/<FD>` ou reinicie o processo.

## Rede

| Comando | O que faz |
|---|---|
| `ip -br a` | IPs de todas as interfaces, em uma linha cada |
| `ip r` | Tabela de rotas e gateway padrão |
| `ip -s link` | Erros e descartes por interface |
| `ss -tulnp` | Portas TCP/UDP em escuta e o processo dono |
| `ss -tanp \| grep 1521` | Conexões no listener Oracle |
| `ping -c 4 host` | Teste de conectividade |
| `tracepath host` / `traceroute host` | Caminho até o destino |
| `mtr host` | Traceroute contínuo com perda por salto |
| `dig host` · `dig -x IP` | DNS direto e reverso |
| `getent hosts host` | Resolução usando `/etc/hosts` + DNS (como as aplicações enxergam) |
| `nc -zv host 1521` | A porta está acessível? (firewall x serviço) |
| `curl -vk https://host:porta` | Testa HTTP/HTTPS e mostra o handshake TLS |
| `ethtool eth0` | Velocidade, duplex e link da placa |
| `sudo tcpdump -i eth0 port 1521 -c 50` | Captura pacotes da porta 1521 |

Firewall:

```bash
sudo firewall-cmd --state
sudo firewall-cmd --list-all
sudo firewall-cmd --permanent --add-port=1521/tcp && sudo firewall-cmd --reload
```

> ⚠️ Cuidado com `systemctl stop firewalld` e regras de firewall em servidores remotos: é fácil cortar o próprio acesso SSH.

## Serviços e logs (systemd)

| Comando | O que faz |
|---|---|
| `systemctl status sshd` | Estado, PID e últimas linhas de log do serviço |
| `systemctl list-units --type=service --state=failed` | Serviços que falharam |
| `systemctl list-unit-files --state=enabled` | O que sobe no boot |
| `sudo systemctl restart chronyd` | Reinicia um serviço |
| `sudo systemctl enable --now serviço` | Habilita no boot e inicia agora |
| `journalctl -u sshd --since "1 hour ago"` | Log de um serviço na última hora |
| `journalctl -p err -b` | Erros desde o último boot |
| `journalctl -f` | Acompanha o log em tempo real |
| `journalctl --disk-usage` | Espaço usado pelos logs do journal |
| `tail -f /var/log/messages` | Log geral do sistema (RHEL/OL) |
| `grep -i fail /var/log/secure` | Falhas de autenticação |

## Usuários e permissões

| Comando | O que faz |
|---|---|
| `id oracle` | UID, grupos e grupo primário |
| `whoami` · `who` · `w` | Usuário atual e quem está logado |
| `sudo -l` | O que o usuário pode executar com sudo |
| `chage -l oracle` | Expiração de senha da conta |
| `ulimit -a` | Limites da sessão atual |
| `cat /etc/security/limits.d/*.conf` | Limites configurados (nofile, nproc, memlock) |
| `ls -ld /u01/app` | Dono e permissões de um diretório |
| ⚠️ `chown -R oracle:oinstall /u01/app` | Muda o dono recursivamente — confira o caminho duas vezes |
| `namei -l /u01/app/oracle/product` | Permissões de cada nível do caminho |
| `getenforce` | Estado do SELinux |

> Erros de "ORA-27102: out of memory" ou de abertura de arquivos costumam ser `memlock`, `nofile` ou `nproc` em `limits.conf`. Lembre: o limite vale para sessões **novas** — e, para serviços do systemd, o que vale é o arquivo da unit.

## Pacotes e atualizações

| Comando | O que faz |
|---|---|
| `dnf check-update` | Atualizações disponíveis (`yum` no OL/RHEL 7) |
| `dnf history` | Histórico de instalações e updates |
| `rpm -qa \| grep -i oracle` | Pacotes instalados pelo nome |
| `rpm -qf /usr/bin/sar` | Qual pacote instalou um arquivo |
| `dnf provides */iostat` | Qual pacote fornece um comando que não existe |
| `rpm -q oracle-database-preinstall-19c` | Pacote de pré-requisitos do Oracle 19c instalado? |
| `uname -r; rpm -q kernel-uek` | Kernel em uso e kernels UEK instalados |

## Kernel e parâmetros

```bash
sysctl -a | grep -E "shmmax|shmall|sem|file-max|hugepages"   # parâmetros do Oracle
sysctl vm.swappiness
cat /sys/kernel/mm/transparent_hugepage/enabled              # THP: Oracle recomenda [never]
cat /proc/cmdline                                            # parâmetros de boot do kernel
```

## Reboot e desligamento

| Comando | O que faz |
|---|---|
| ⚠️ `sudo shutdown -r +5 "Reboot para manutenção"` | Reinicia em 5 minutos avisando os usuários logados |
| `sudo shutdown -c` | Cancela o shutdown agendado |
| ⚠️ `sudo reboot` | Reinicia imediatamente |

> Em servidores de banco, pare as instâncias e o cluster **antes** do reboot (`srvctl stop database` / `crsctl stop crs`). Um reboot "seco" vira recuperação de instância na volta.

## Extra: atalhos que economizam tempo

```bash
watch -n 2 "df -h /u01"          # repete um comando a cada 2 s
history | grep srvctl            # encontra um comando já usado
Ctrl+R                           # busca reversa no histórico
!!                               # repete o último comando (sudo !! = repete com sudo)
nohup comando > saida.log 2>&1 & # roda em background e sobrevive ao logout
tmux / screen                    # sessão que não cai se a VPN cair
```

## Resumo

- Lentidão → `uptime`, `vmstat`, `iostat -xz`, `top`.
- Disco cheio → `df -hT`, `du --max-depth=1`, `lsof +L1`.
- Rede → `ip -br a`, `ss -tulnp`, `nc -zv host porta`, `dig`.
- Serviço com problema → `systemctl status` e `journalctl -u`.
- Processo morto misteriosamente → `dmesg -T | grep -i oom`.
- E sempre: confira o `hostname` antes de qualquer comando com ⚠️.
