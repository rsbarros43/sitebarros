# Exadata for Azure — Enterprise Academy

Plataforma educacional single-page (HTML/CSS/JS, sem dependências externas além de fontes do Google) para treinamento em Oracle Exadata Database Service integrado ao Microsoft Azure, com trilha multicloud (Azure + OCI).

## Incluído
- Identificação do aluno sob demanda: os 16 módulos de "Formação" ficam livres para explorar, mas a partir do Deployment Center ("Do zero ao Go-Live") — Deployment Center, Labs, Resource Center, Scripts e Quiz — as seções aparecem visualmente desabilitadas; ao clicar em qualquer item ali, aparece a tela pedindo o nome completo do aluno. Assim que o nome é informado, ele aparece no cabeçalho ao lado de "Formação", junto de um botão "🔄 Reiniciar" que apaga o nome e todo o progresso salvo, permitindo recomeçar a trilha do zero a qualquer momento
- 16 módulos com conteúdo específico (arquitetura, rede, RAC, ASM, CDB/PDB, conectividade, segurança e identidade, backup, Data Guard/MAA, performance, monitoramento, patching, troubleshooting, automação/IaC, entre outros)
- Deployment Center com 15 etapas end-to-end, com diagrama interativo clicável (não mais estático)
- 16 laboratórios com cards funcionais (abrem o módulo correspondente)
- Simulador de terminal em cada módulo/etapa: saída pré-pronta e modo interativo (digite o comando e veja o resultado)
- Modo de cenário com erro ("⚠ Simular incidente") no módulo de Troubleshooting, com diagnóstico guiado e botão para restaurar o cenário normal
- Telas ilustrativas (wireframes fiéis) do Azure Portal e do console OCI em praticamente todos os módulos e etapas do Deployment Center, cobrindo instalação, configuração, administração e o resultado final do ambiente instalado (OCI e Azure)
- Seção "Scripts e verificações" com todos os comandos organizados por categoria (Azure, OCI, Oracle Database/RAC/ASM, Data Guard) e terminal próprio para validar os scripts
- Resource Center pesquisável com referências oficiais Oracle/Microsoft
- Quiz com 17 perguntas cobrindo praticamente todos os módulos, com feedback individual por pergunta (resposta correta e explicação, mesmo em caso de acerto, erro ou pergunta não respondida)
- Certificado com layout profissional (estilo certificado oficial), gerado em PDF de página única, com nome do aluno responsivo (não estoura o layout mesmo com nomes longos)
- Certificado reflete o progresso real do aluno: mostra "Certificado de Progresso" (com percentual e contagem real de módulos/etapas concluídos) enquanto a trilha não foi finalizada, e só emite "Certificado de Conclusão" quando os 16 módulos e as 15 etapas do Deployment Center foram completados
- Progresso salvo localmente (localStorage), com exportação/importação em arquivo JSON — permite levar o progresso para outro navegador/dispositivo ou recuperá-lo após limpar o cache
- Layout responsivo revisado (menu de navegação, cards e certificado se adaptam a telas de celular/tablet) e melhorias de acessibilidade (modal com foco automático, fechamento com tecla Esc, atributos ARIA)
- Favicon próprio (selo "EXA")

## Executar
```bash
python3 -m http.server 8080
```
Abra http://localhost:8080

## Segurança
Use os comandos como modelos educacionais. Substitua placeholders e valide documentação, permissões, regiões, limites, licenciamento e procedimentos antes de qualquer execução em produção.

## Changelog

### v0.3.5 (revisão atual)
- O nome do aluno agora aparece no cabeçalho, ao lado do link "Formação", assim que é informado (antes ficava apenas em um painel mais abaixo na página)
- Adicionado botão "🔄 Reiniciar" ao lado do nome no cabeçalho: apaga o nome do aluno e todo o progresso salvo (com confirmação antes de executar), permitindo recomeçar a trilha do zero — útil para quem quer testar com outro nome ou reiniciar o curso no meio ou no final

### v0.3.4
- Revisado o fluxo de identificação do aluno: em vez de bloquear a página inteira no primeiro acesso, agora apenas as seções a partir do Deployment Center ("Do zero ao Go-Live") ficam visualmente desabilitadas (esmaecidas, com um aviso de cadeado); a tela de nome só aparece quando o aluno clica em algum item dessas seções, e a partir daí elas ficam liberadas para o restante da sessão. Os 16 módulos de "Formação" continuam livres para consulta sem precisar de nome

### v0.3.3
- Adicionado favicon próprio (antes a aba do navegador usava o ícone padrão e gerava um 404 silencioso)

### v0.3.2
- Quiz: cada pergunta agora mostra feedback individual após a correção (se você acertou, errou ou deixou em branco), com a resposta certa e uma explicação do porquê
- Progresso: adicionados botões "Exportar progresso" e "Importar progresso" (arquivo JSON), já que o progresso salvo no navegador (localStorage) se perde ao trocar de dispositivo ou limpar o cache
- Responsividade: corrigido menu de navegação que ficava oculto em telas menores que 950px; corrigido overflow horizontal em cards/etapas em telas de celular (texto agora quebra corretamente em vez de vazar da tela)
- Acessibilidade: modal de conteúdo ganhou role="dialog"/aria-modal, foco automático no botão fechar ao abrir, retorno de foco ao fechar e fechamento pela tecla Esc
- Certificado: nome do aluno agora usa fonte responsiva e quebra de linha segura, evitando que nomes longos estourem o layout do certificado

### v0.3.1
- Adicionadas telas de console (Azure/OCI) para os módulos de Rede, Conectividade, Troubleshooting e Automação/IaC, completando a cobertura visual de instalação/configuração/administração em todos os módulos
- Novo modo de cenário com erro no simulador de terminal do módulo de Troubleshooting ("⚠ Simular incidente" / "↺ Cenário normal"), com transcrição de diagnóstico guiado
- Quiz expandido de 6 para 17 perguntas, cobrindo praticamente todos os módulos do curso
- Corrigida a lógica do certificado: antes exibia sempre "16/16 módulos concluídos" de forma fixa, independente do progresso real; agora lê o progresso salvo no navegador e gera "Certificado de Progresso" (com números e percentual reais) ou "Certificado de Conclusão" (somente quando 100% da trilha foi concluída)

### v0.3.0
- Simulador de terminal (saída pré-pronta + modo interativo) em todos os módulos e etapas
- Telas wireframe do Azure Portal e console OCI na maior parte dos módulos e etapas
- Cabeçalho redesenhado com selo/logo "EXA" e tipografia revisada
- Diagrama do Deployment Center e cards de laboratórios tornados totalmente interativos (antes eram apenas visuais)
- Nova seção "Scripts e verificações" com comandos agrupados por categoria e terminal de validação
- Fonte da navegação superior aumentada para melhor legibilidade
- Rodapé com créditos (Renato Barros / Barros & Barros Consultoria e Suporte) e aviso educacional
- Certificado redesenhado com visual profissional, impressão em PDF de página única
- Removidas referências de número de versão e changelog da página (informação mantida apenas neste README)
