---
title: "Comandos do Windows para troubleshooting: o guia de bolso (CMD + PowerShell)"
descricao: "Mais de 100 comandos de CMD e PowerShell organizados por situação — reparo do sistema, rede, disco, boot, usuários, serviços e atualizações — com alertas sobre o que é destrutivo ou obsoleto."
tipo: blog
categoria: Windows
tags: [windows, powershell, cmd, troubleshooting, cheat sheet]
---

Nem todo dia é Oracle. Às vezes o problema está no servidor Windows do aplicativo, na estação do usuário ou na própria máquina de onde acessamos o banco. Reuni aqui os comandos que mais resolvem no dia a dia, organizados **por situação**, com observações sobre o que mudou nas versões recentes do Windows.

> **Antes de tudo:** a maioria dos comandos abaixo exige um prompt **como Administrador** (clique direito no CMD/PowerShell → *Executar como administrador*). Os itens marcados com ⚠️ apagam dados, mudam o boot ou derrubam a rede — leia duas vezes antes de executar.

## Reparo do Windows: a ordem que funciona

Quando o sistema está instável, a sequência recomendada é **DISM → SFC → CHKDSK**. O DISM conserta a imagem de componentes que o SFC usa como fonte; rodar o SFC antes pode não resolver nada.

```plaintext
DISM /Online /Cleanup-Image /CheckHealth
DISM /Online /Cleanup-Image /ScanHealth
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
chkdsk C: /f /r
```

| Comando | O que faz |
|---|---|
| `DISM /Online /Cleanup-Image /RestoreHealth` | Repara a imagem do Windows (usa o Windows Update como fonte) |
| `sfc /scannow` | Verifica e restaura arquivos de sistema corrompidos |
| `chkdsk C: /f /r` | Corrige erros e setores defeituosos — no disco do sistema, agenda para o próximo boot |
| `fsutil dirty query C:` | Mostra se o volume está marcado para verificação |
| `systeminfo` | Versão, build, uptime, hotfixes e memória |
| `winver` | Versão e build em uma janela |
| `cleanmgr` | Limpeza de disco |
| `powercfg /batteryreport` | Gera relatório HTML da saúde da bateria (notebooks) |
| `shutdown /r /f /t 0` | Reinicia imediatamente, fechando os programas à força |

## Rede

| Comando | O que faz |
|---|---|
| `ipconfig /all` | IP, máscara, gateway, DNS e MAC de todas as interfaces |
| `ipconfig /release` · `ipconfig /renew` | Libera e renova o IP via DHCP |
| `ipconfig /flushdns` | Limpa o cache de DNS local |
| `ipconfig /displaydns` | Mostra o que está no cache de DNS |
| `ping -t 8.8.8.8` | Ping contínuo (Ctrl+C para parar) |
| `tracert google.com` | Caminho (saltos) até o destino |
| `pathping google.com` | Traceroute com estatística de perda por salto |
| `nslookup servidor.dominio` | Consulta DNS |
| `netstat -ano` | Conexões e portas abertas, com o PID do processo |
| `arp -a` | Tabela ARP (IP × MAC) |
| `route print` | Tabela de rotas |
| `netsh wlan show profile` | Redes Wi-Fi salvas |
| ⚠️ `netsh winsock reset` | Reseta o Winsock (exige reboot) |
| ⚠️ `netsh int ip reset` | Reseta a pilha TCP/IP (exige reboot) |

**No PowerShell**, prefira os equivalentes modernos:

```powershell
Test-NetConnection srv-banco01 -Port 1521      # testa a porta do listener Oracle
Test-Connection google.com -Count 4            # ping
Resolve-DnsName srv-banco01                    # nslookup
Get-NetAdapter                                 # placas de rede
Get-NetIPConfiguration                         # resumo de IP/gateway/DNS
Get-NetTCPConnection -State Listen | Sort-Object LocalPort   # portas em escuta
```

> O `Test-NetConnection ... -Port 1521` é o meu favorito: responde em segundos se o problema é rede/firewall ou banco.

## Disco e arquivos

| Comando | O que faz |
|---|---|
| `diskmgmt.msc` | Gerenciamento de Disco |
| `defrag C: /O` | Otimiza o volume (TRIM em SSD, desfragmentação em HDD) |
| `robocopy origem destino /E /COPY:DAT /R:2 /W:5 /LOG:copia.log` | Cópia robusta com subpastas, retentativas e log |
| `xcopy origem destino /E /H /C /I` | Copia pastas, incluindo ocultos |
| `attrib -h -r -s /s /d *.*` | Remove atributos oculto/somente leitura/sistema |
| ⚠️ `del /f /s /q %TEMP%\*` | Apaga os arquivos temporários do usuário |
| ⚠️ `rmdir /s /q pasta` | Remove a pasta e todo o conteúdo, sem confirmação |
| ⚠️ `robocopy origem destino /MIR` | Espelha — **apaga no destino** o que não existe na origem |

No PowerShell:

```powershell
Get-Volume                                     # espaço livre por volume
Get-PSDrive -PSProvider FileSystem             # idem, formato simples
Get-ChildItem C:\ -Recurse -File -ErrorAction SilentlyContinue |
  Sort-Object Length -Descending | Select-Object -First 20 FullName, @{n='MB';e={[math]::Round($_.Length/1MB)}}
```

O último comando lista os 20 maiores arquivos do disco — útil quando o `C:` enche e ninguém sabe por quê.

## Boot, recuperação e segurança

| Comando | O que faz |
|---|---|
| `bcdedit /enum all` | Lista as entradas de boot |
| ⚠️ `bcdedit /set {default} safeboot minimal` | Próximo boot em Modo de Segurança |
| ⚠️ `bcdedit /deletevalue {default} safeboot` | Volta ao boot normal |
| `reagentc /info` · `reagentc /enable` | Status e ativação do Ambiente de Recuperação (WinRE) |
| ⚠️ `bcdboot C:\Windows` | Recria os arquivos de boot (funciona em UEFI e BIOS) |
| ⚠️ `bootrec /fixmbr` · `/fixboot` · `/rebuildbcd` | Reparo de boot **somente pelo WinRE** e em discos MBR/BIOS legado |
| `rstrui` | Restauração do Sistema |
| `wf.msc` | Firewall com Segurança Avançada |
| `netsh advfirewall show allprofiles` | Estado do firewall por perfil |
| ⚠️ `netsh advfirewall set allprofiles state off` | Desliga o firewall (use só para teste e religue com `on`) |
| `start ms-settings:windowsdefender` | Abre a Segurança do Windows |

> Em máquinas modernas (UEFI/GPT), o `bootrec /fixmbr` não se aplica — o caminho é `bcdboot` a partir do WinRE.

## Usuários e contas

| Comando | O que faz |
|---|---|
| `whoami /all` | Usuário atual, grupos e privilégios |
| `net user` | Lista usuários locais |
| `net user fulano` | Detalhes da conta (expiração, último logon, grupos) |
| `net user fulano * /add` | Cria usuário pedindo a senha (não fica no histórico) |
| `net localgroup administradores fulano /add` | Coloca no grupo de administradores (em Windows em inglês: `administrators`) |
| ⚠️ `net user fulano /delete` | Remove o usuário |
| `net user administrador /active:yes` | Habilita o administrador interno (`administrator` em inglês) |
| `net accounts` | Política de senha e bloqueio |
| `netplwiz` | Contas de usuário (interface gráfica) |

No PowerShell:

```powershell
Get-LocalUser
Get-LocalGroupMember -Group "Administradores"
Disable-LocalUser -Name "Convidado"
```

> Evite `net user fulano SenhaAqui /add`: a senha fica gravada no histórico do terminal e em logs de auditoria.

## Serviços e ferramentas do sistema

Atalhos que valem decorar — todos funcionam pelo **Win+R**:

| Atalho | Abre |
|---|---|
| `services.msc` | Serviços |
| `eventvwr.msc` | Visualizador de Eventos |
| `taskmgr` | Gerenciador de Tarefas |
| `resmon` | Monitor de Recursos (I/O e rede por processo) |
| `perfmon` | Monitor de Desempenho |
| `compmgmt.msc` | Gerenciamento do Computador |
| `gpedit.msc` | Política de Grupo local (não existe na edição Home) |
| `msconfig` | Configuração do sistema / boot |
| `sysdm.cpl` | Propriedades do sistema (nome, domínio, variáveis de ambiente) |
| `ncpa.cpl` | Conexões de rede |
| `appwiz.cpl` | Programas e recursos |
| `timedate.cpl` | Data e hora |

E pela linha de comando:

```plaintext
REM Estado e configuração de um serviço (tipo de início, conta, binário)
sc query wuauserv
sc qc OracleServiceORCL

REM Reiniciar um serviço
net stop spooler && net start spooler

REM Processos e os serviços dentro de cada um; encerrar pelo PID
tasklist /svc
taskkill /PID 1234 /F
```

## PowerShell para administração

```powershell
# Serviços em execução e os que deveriam estar rodando, mas pararam
Get-Service | Where-Object Status -eq 'Running'
Get-CimInstance Win32_Service | Where-Object { $_.StartMode -eq 'Auto' -and $_.State -ne 'Running' } |
  Select-Object Name, DisplayName, State

# Top 10 processos por CPU e por memória
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10 Name, Id, CPU
Get-Process | Sort-Object WorkingSet64 -Descending | Select-Object -First 10 Name, Id, @{n='MB';e={[math]::Round($_.WorkingSet64/1MB)}}

# Últimos erros do log de Sistema (funciona no PowerShell 5.1 e 7)
Get-WinEvent -FilterHashtable @{LogName='System'; Level=2} -MaxEvents 20

# Informações gerais, hotfixes e uptime
Get-ComputerInfo | Select-Object OsName, OsVersion, CsName, OsLastBootUpTime
Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 10

# Recursos do Windows
Get-WindowsOptionalFeature -Online | Where-Object State -eq 'Enabled'   # estações
Get-WindowsFeature | Where-Object Installed                              # Windows Server

Restart-Service -Name Spooler
Stop-Process -Name notepad
Restart-Computer -Force
```

> `Get-EventLog` ainda funciona no Windows PowerShell 5.1, mas **não existe no PowerShell 7**. Prefira `Get-WinEvent`.

## Windows Update e ativação

| Comando | O que faz |
|---|---|
| `start ms-settings:windowsupdate` | Abre o Windows Update |
| `sc query wuauserv` | Estado do serviço do Windows Update |
| `slmgr /dli` | Informações da licença |
| `slmgr /xpr` | Data de expiração / status da ativação |
| `slmgr /ato` | Força a ativação |

> Os antigos `wuauclt /detectnow` e `/updatenow` **não funcionam mais** a partir do Windows 10. O `usoclient` existe, mas é interno e não documentado — o caminho suportado é a tela de configurações ou o módulo `PSWindowsUpdate` (da PowerShell Gallery) em servidores.

## Utilitários rápidos (Win+R)

`calc` · `notepad` · `mspaint` · `snippingtool` · `osk` (teclado virtual) · `magnify` · `charmap` · `mstsc` (Área de Trabalho Remota) · `inetcpl.cpl` (Opções da Internet) · `control` (Painel de Controle)

## Extra: fora da caixa, mas útil

O **Sysinternals** (Microsoft) não vem instalado, mas resolve muita coisa: `Process Explorer`, `Autoruns`, `TCPView` e o `sdelete` (apagamento seguro de arquivos). Baixe direto do site da Microsoft.

## Resumo

- Sistema instável → **DISM, depois SFC, depois CHKDSK**.
- Rede → `ipconfig /all`, `Test-NetConnection -Port`, `nslookup`/`Resolve-DnsName`.
- Disco cheio → `Get-Volume` e o script dos 20 maiores arquivos.
- Serviço parado → `services.msc`, `sc qc` e o filtro de serviços automáticos parados.
- E sempre: **prompt como Administrador** e atenção redobrada nos comandos com ⚠️.
