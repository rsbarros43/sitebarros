// OpenShift Enterprise Academy - certificate module

function oeaCertContainer(){ return document.getElementById('certificateApp'); }

function oeaCertHash(str){
  let h = 0;
  for(let i = 0; i < str.length; i++){
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(16).toUpperCase().padStart(8, '0');
}

function oeaCertId(name){
  let id = localStorage.getItem('oea_cert_id');
  if(!id){
    id = 'OEA-' + oeaCertHash(name + new Date().toDateString());
    localStorage.setItem('oea_cert_id', id);
  }
  return id;
}

function oeaCertDate(){
  let stored = localStorage.getItem('oea_cert_date');
  if(!stored){
    stored = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    localStorage.setItem('oea_cert_date', stored);
  }
  return stored;
}

function renderCertificate(){
  const box = oeaCertContainer();
  if(!box) return;

  const name = (typeof getName === 'function') ? getName() : (localStorage.getItem('oea_name') || '');
  const passed = localStorage.getItem('oea_quiz_passed') === 'true';
  const score = localStorage.getItem('oea_quiz_score');

  if(!name){
    box.innerHTML = `<div class="cert-locked">
      <h3>🔒 Identifique-se primeiro</h3>
      <p>Preencha seu nome no card "Identificação" no topo desta página para liberar a emissão do certificado.</p>
    </div>`;
    return;
  }

  if(!passed){
    box.innerHTML = `<div class="cert-locked">
      <h3>🔒 Certificado bloqueado</h3>
      <p>Você precisa concluir o <b>Quiz</b> com pelo menos 70% de aproveitamento para liberar seu certificado.${score ? ` Sua última tentativa teve ${score}%.` : ''}</p>
      <a class="btn" href="13-quiz.html">Ir para o quiz ›</a>
    </div>`;
    return;
  }

  const certId = oeaCertId(name);
  const date = oeaCertDate();

  box.innerHTML = `
    <div class="certificate" id="certificatePrintArea">
      <div class="cert-border">
        <div class="cert-seal">RH</div>
        <div class="cert-eyebrow">OPENSHIFT ENTERPRISE ACADEMY</div>
        <h2 class="cert-title">Certificado de Conclusão</h2>
        <p class="cert-sub">Certificamos que</p>
        <p class="cert-name">${oeaCertEscape(name)}</p>
        <p class="cert-body">concluiu com aproveitamento a trilha completa de <b>OpenShift Enterprise Academy</b>, incluindo instalação do OpenShift Local (CRC), administração via <b>oc</b> CLI, deploy de aplicação Flask e pipeline de CI/CD com Tekton, Triggers e integração via webhook do GitHub.</p>
        <div class="cert-meta">
          <div><span>Data de emissão</span><b>${date}</b></div>
          <div><span>Código de verificação</span><b>${certId}</b></div>
        </div>
      </div>
    </div>
    <div class="cert-actions">
      <button class="btn" onclick="window.print()">🖨 Imprimir / Salvar como PDF</button>
    </div>
  `;
}

function oeaCertEscape(s){
  return String(s).replace(/[&<>]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[ch]));
}

document.addEventListener('DOMContentLoaded', function(){
  if(oeaCertContainer()) renderCertificate();
});
