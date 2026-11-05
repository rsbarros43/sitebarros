// OpenShift Enterprise Academy - quiz module

const OEA_QUIZ_MODULE_INDEX = 12; // 0-based index of "Quiz" in OEA_MODULES
const OEA_QUIZ_PASS_PCT = 70;

const OEA_QUIZ_QUESTIONS = [
  {
    q: "O que é o CRC (OpenShift Local)?",
    options: [
      "Um cluster OpenShift multi-nó pronto para produção",
      "Uma VM local com um cluster OpenShift de um único nó, voltada para estudo e desenvolvimento",
      "Um plugin do navegador para acessar o console web",
      "Um serviço da Red Hat hospedado na nuvem"
    ],
    correct: 1,
    explain: "O CRC cria uma máquina virtual local com um cluster OpenShift de um nó, ideal para aprender e testar sem precisar de infraestrutura em nuvem."
  },
  {
    q: "Qual comando autentica a CLI oc no cluster?",
    options: ["oc connect", "oc login", "oc auth", "oc start"],
    correct: 1,
    explain: "oc login autentica o terminal contra o cluster usando usuário/senha ou token."
  },
  {
    q: "Em OpenShift, o que é um 'Project'?",
    options: [
      "Um sinônimo de Pod",
      "Um tipo de Deployment específico da Red Hat",
      "Um namespace do Kubernetes com camadas adicionais de administração do OpenShift",
      "Um repositório Git conectado ao cluster"
    ],
    correct: 2,
    explain: "Project é a forma como o OpenShift expõe e administra namespaces do Kubernetes, adicionando RBAC e cotas próprias."
  },
  {
    q: "Qual recurso expõe uma aplicação para acesso externo via URL no OpenShift?",
    options: ["Service", "Route", "Deployment", "PersistentVolume"],
    correct: 1,
    explain: "A Route é o recurso nativo do OpenShift que expõe um Service para acesso externo via URL, com suporte a TLS."
  },
  {
    q: "No Tekton, o que é uma 'Task'?",
    options: [
      "O encadeamento completo de todas as etapas de CI/CD",
      "Uma unidade reutilizável de trabalho dentro de uma pipeline",
      "O nome do agendador de pods do OpenShift",
      "Um tipo de Secret usado para autenticação"
    ],
    correct: 1,
    explain: "Task é a menor unidade reutilizável de trabalho no Tekton. Pipelines encadeiam várias Tasks."
  },
  {
    q: "O que representa uma 'PipelineRun'?",
    options: [
      "A definição estática de uma pipeline",
      "Uma execução concreta de uma Pipeline, com seu próprio histórico e status",
      "Um tipo de Trigger do GitHub",
      "O log de erros do cluster"
    ],
    correct: 1,
    explain: "PipelineRun é a instância de execução real de uma Pipeline — cada push, por exemplo, pode gerar uma nova PipelineRun."
  },
  {
    q: "Qual a função do EventListener no Tekton Triggers?",
    options: [
      "Armazenar os logs da aplicação",
      "Expor um endpoint HTTP que recebe webhooks e dispara PipelineRuns",
      "Compilar a imagem da aplicação",
      "Validar o pull secret do cluster"
    ],
    correct: 1,
    explain: "O EventListener recebe requisições HTTP (como um webhook do GitHub) e, junto com TriggerBinding/TriggerTemplate, dispara uma nova PipelineRun automaticamente."
  },
  {
    q: "Um pod fica em CrashLoopBackOff. Qual comando ajuda a entender a causa raiz mais rápido?",
    options: ["oc get projects", "oc logs <pod>", "crc console", "oc whoami"],
    correct: 1,
    explain: "oc logs mostra a saída/erro da aplicação dentro do container, geralmente a forma mais rápida de identificar a causa de um CrashLoopBackOff."
  },
  {
    q: "Por que uma Route pode retornar 503 mesmo com o Deployment aplicado?",
    options: [
      "Porque o namespace tem um nome muito longo",
      "Porque nenhum pod está Ready ou o Service aponta para o selector errado",
      "Porque o ngrok está desligado",
      "Porque o CRC precisa ser reiniciado sempre"
    ],
    correct: 1,
    explain: "503 na Route normalmente indica que não há pods saudáveis atrás do Service, ou que o selector do Service não bate com os labels do Deployment."
  },
  {
    q: "Qual a ordem correta do fluxo de CI/CD construído no laboratório?",
    options: [
      "Deploy → Build → GitHub Push → Webhook",
      "GitHub Push → Webhook → EventListener → PipelineRun → Build → Deploy",
      "Webhook → Deploy → Build → GitHub Push",
      "PipelineRun → GitHub Push → Deploy → Webhook"
    ],
    correct: 1,
    explain: "O fluxo completo começa no push ao GitHub, passa pelo webhook e EventListener, dispara a PipelineRun, executa o build e finaliza no deploy."
  }
];

function oeaQuizContainer(){ return document.getElementById('quizApp'); }

function oeaQuizState(){
  if(!window._oeaQuizAnswers) window._oeaQuizAnswers = new Array(OEA_QUIZ_QUESTIONS.length).fill(null);
  return window._oeaQuizAnswers;
}

function renderQuiz(){
  const box = oeaQuizContainer();
  if(!box) return;
  const answers = oeaQuizState();
  const html = OEA_QUIZ_QUESTIONS.map((item, qi) => {
    const opts = item.options.map((opt, oi) => {
      const selected = answers[qi] === oi ? 'selected' : '';
      return `<button type="button" class="quiz-option ${selected}" onclick="oeaSelectAnswer(${qi},${oi})">${opt}</button>`;
    }).join('');
    return `<div class="quiz-question" id="quizQ${qi}">
      <div class="quiz-question-head"><span class="quiz-number">${qi+1}</span><span class="quiz-text">${item.q}</span></div>
      <div class="quiz-options">${opts}</div>
    </div>`;
  }).join('');
  box.innerHTML = `<div class="quiz-progress" id="quizProgress"></div><div class="quiz-list">${html}</div>
    <div class="quiz-actions"><button class="btn" id="quizSubmitBtn" onclick="submitQuiz()">Corrigir quiz</button></div>
    <div id="quizResult"></div>`;
  updateQuizProgress();
}

function oeaSelectAnswer(qi, oi){
  const answers = oeaQuizState();
  answers[qi] = oi;
  renderQuiz();
}

function updateQuizProgress(){
  const answers = oeaQuizState();
  const answered = answers.filter(a => a !== null).length;
  const el = document.getElementById('quizProgress');
  if(el) el.textContent = `${answered} de ${OEA_QUIZ_QUESTIONS.length} perguntas respondidas`;
}

function submitQuiz(){
  const answers = oeaQuizState();
  if(answers.some(a => a === null)){
    alert('Responda todas as perguntas antes de corrigir o quiz.');
    return;
  }
  let correctCount = 0;
  OEA_QUIZ_QUESTIONS.forEach((item, qi) => {
    const qBox = document.getElementById('quizQ'+qi);
    if(!qBox) return;
    const buttons = qBox.querySelectorAll('.quiz-option');
    buttons.forEach((btn, oi) => {
      btn.classList.remove('selected');
      btn.disabled = true;
      if(oi === item.correct) btn.classList.add('correct');
      else if(oi === answers[qi]) btn.classList.add('incorrect');
    });
    if(answers[qi] === item.correct) correctCount++;
    const expl = document.createElement('div');
    expl.className = 'quiz-explain';
    expl.textContent = item.explain;
    qBox.appendChild(expl);
  });

  const pct = Math.round((correctCount / OEA_QUIZ_QUESTIONS.length) * 100);
  const passed = pct >= OEA_QUIZ_PASS_PCT;

  localStorage.setItem('oea_quiz_score', String(pct));
  localStorage.setItem('oea_quiz_passed', passed ? 'true' : 'false');
  localStorage.setItem('oea_quiz_completed_at', new Date().toISOString());

  const submitBtn = document.getElementById('quizSubmitBtn');
  if(submitBtn) submitBtn.style.display = 'none';

  const resultBox = document.getElementById('quizResult');
  if(resultBox){
    resultBox.innerHTML = `
      <div class="quiz-result ${passed ? 'quiz-pass' : 'quiz-fail'}">
        <div class="quiz-score-circle">${pct}%</div>
        <div>
          <h3>${passed ? '✓ Aprovado!' : 'Quase lá'}</h3>
          <p>Você acertou ${correctCount} de ${OEA_QUIZ_QUESTIONS.length} perguntas. ${passed ? 'Seu certificado já está liberado.' : `É necessário pelo menos ${OEA_QUIZ_PASS_PCT}% para liberar o certificado.`}</p>
          <div class="quiz-result-actions">
            <button class="btn outline" onclick="retryQuiz()">↻ Refazer quiz</button>
            ${passed ? '<a class="btn" href="14-certificado.html">Emitir certificado ›</a>' : ''}
          </div>
        </div>
      </div>`;
  }

  if(passed && typeof markModule === 'function'){
    markModule(OEA_QUIZ_MODULE_INDEX);
  }
}

function retryQuiz(){
  window._oeaQuizAnswers = new Array(OEA_QUIZ_QUESTIONS.length).fill(null);
  renderQuiz();
}

document.addEventListener('DOMContentLoaded', function(){
  if(oeaQuizContainer()) renderQuiz();
});
