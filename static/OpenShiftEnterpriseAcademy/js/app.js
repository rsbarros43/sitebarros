const OEA_MODULES = [
  ['Introdução','01-introducao.html'],['Pré-requisitos','02-pre-requisitos.html'],['Instalação do CRC','03-instalacao-crc.html'],['Acesso e Primeiro Login','04-primeiro-login.html'],['Simulador de terminal oc','05-terminal-oc.html'],['Gerenciando projetos','06-gerenciando-projetos.html'],['Explorando o cluster','07-explorando-cluster.html'],['Deploy da aplicação Flask','08-deploy-flask.html'],['Pipelines Tekton','09-pipelines-tekton.html'],['Triggers','10-triggers.html'],['Projeto Final CI/CD','11-projeto-final-cicd.html'],['Troubleshooting','12-troubleshooting.html'],['Quiz','13-quiz.html'],['Certificado','14-certificado.html']
];
const outputs={
'help':'Comandos disponíveis:\ncrc status\ncrc setup\ncrc start\ncrc stop\ncrc console\noc login\noc whoami\noc get projects\noc get pods\noc get nodes\noc get all\noc describe node\noc new-project tekton-lab\ntkn version\noc project tekton-lab\noc get pods -o wide\noc get events --sort-by=.lastTimestamp\noc apply -f openshift/deployment.yaml\noc apply -f tekton/pipelines/pipeline.yaml\noc get pipelinerun --sort-by=.metadata.creationTimestamp',
'crc status':'CRC VM: Running\nOpenShift: Running\nRAM Usage: 10.8GB of 16GB\nDisk Usage: 35GB of 120GB\nConsole URL: https://console-openshift-console.apps-crc.testing',
'crc setup':'INFO Checking if running as non-root\nINFO Checking virtualization\nINFO Setting up libvirt network\nINFO Setup completed successfully',
'crc start':'INFO Starting CRC VM\nINFO Waiting for kube-apiserver availability\nINFO Adding crc-admin and crc-developer contexts\nStarted the OpenShift cluster. Console: https://console-openshift-console.apps-crc.testing',
'crc stop':'INFO Stopping OpenShift cluster\nStopped the OpenShift cluster',
'crc console':'Opening the OpenShift Web Console...\nhttps://console-openshift-console.apps-crc.testing',
'oc login':'Login successful.\nYou have access to 70 projects, the list has been suppressed.\nUsing project "default".',
'oc whoami':'kubeadmin',
'oc get projects':'NAME                                      DISPLAY NAME                         STATUS    AGE\ndefault                                   Default                              Active    2d\nkube-node-lease                           kube-node-lease                      Active    2d\nkube-public                               Kubernetes Public                    Active    2d\nkube-system                               Kubernetes System                    Active    2d\nopenshift                                 OpenShift                            Active    2d\nopenshift-console                         OpenShift Console                    Active    2d\ntekton-lab                                Tekton Lab                           Active    1h',
'oc get pods':'NAME                         READY   STATUS    RESTARTS   AGE\nflask-app-7f9dd7d6f8-xk2bp   1/1     Running   0          12m\nregistry-5dcbcff7c9-8qfqw    1/1     Running   0          2d',
'oc get nodes':'NAME                 STATUS   ROLES                         AGE   VERSION\ncrc-xxxxx-master-0   Ready    control-plane,master,worker    2d    v1.29.x',
'oc get all':'pod/flask-app-7f9dd7d6f8-xk2bp       1/1 Running\nservice/flask-app                      ClusterIP 172.30.10.10 8080/TCP\ndeployment.apps/flask-app              1/1\nroute.route.openshift.io/flask-app     flask-app-tekton-lab.apps-crc.testing',
'oc describe node':'Name: crc-xxxxx-master-0\nRoles: control-plane,master,worker\nConditions:\n  Ready True\nAllocatable:\n  cpu: 8\n  memory: 16Gi\nNon-terminated Pods: openshift-console, openshift-dns, tekton-pipelines',
'oc new-project tekton-lab':'Now using project "tekton-lab" on server "https://api.crc.testing:6443".',
'tkn version\noc project tekton-lab\noc get pods -o wide\noc get events --sort-by=.lastTimestamp\noc apply -f openshift/deployment.yaml\noc apply -f tekton/pipelines/pipeline.yaml\noc get pipelinerun --sort-by=.metadata.creationTimestamp':'Client version: 0.36.x\nPipeline version: v0.60.x\nTriggers version: v0.27.x',
"oc project tekton-lab":"Now using project \"tekton-lab\" on server \"https://api.crc.testing:6443\".",
"oc get pods -o wide":"NAME                         READY   STATUS    RESTARTS   AGE   IP           NODE\nflask-app-7f9dd7d6f8-xk2bp   1/1     Running   0          12m   10.217.0.8   crc-xxxxx-master-0",
"oc get events --sort-by=.lastTimestamp":"LAST SEEN   TYPE     REASON      OBJECT                    MESSAGE\n2m          Normal   Scheduled   pod/flask-app              Successfully assigned tekton-lab/flask-app to crc-xxxxx-master-0\n1m          Normal   Pulled      pod/flask-app              Container image pulled\n1m          Normal   Started     pod/flask-app              Started container flask-app",
"oc apply -f openshift/deployment.yaml":"deployment.apps/flask-app configured",
"oc apply -f openshift/service.yaml":"service/flask-app configured",
"oc apply -f openshift/route.yaml":"route.route.openshift.io/flask-app configured",
"oc get deployment,svc,route,pods":"NAME                         READY   UP-TO-DATE   AVAILABLE\ndeployment.apps/flask-app    1/1     1            1\n\nNAME                 TYPE        CLUSTER-IP      PORT(S)\nservice/flask-app    ClusterIP   172.30.10.10    8080/TCP\n\nNAME                                      HOST/PORT\nroute.route.openshift.io/flask-app        flask-app-tekton-lab.apps-crc.testing\n\nNAME                             READY   STATUS\npod/flask-app-7f9dd7d6f8-xk2bp   1/1     Running",
"oc apply -f tekton/tasks/clone-repository.yaml":"task.tekton.dev/clone-repository configured",
"oc apply -f tekton/tasks/build-and-push-image.yaml":"task.tekton.dev/build-and-push-image configured",
"oc apply -f tekton/tasks/deploy-to-openshift.yaml":"task.tekton.dev/deploy-to-openshift configured",
"oc apply -f tekton/pipelines/pipeline.yaml":"pipeline.tekton.dev/flask-app-pipeline configured",
"oc create -f tekton/pipelineruns/manual-pipelinerun.yaml":"pipelinerun.tekton.dev/flask-app-run created",
"tkn pipelinerun logs flask-app-run -f":"[clone-repository] Cloning Git repository...\n[build-and-push-image] Building image with Buildah...\n[build-and-push-image] Pushing to image-registry.openshift-image-registry.svc:5000/tekton-lab/flask-app:latest\n[deploy-to-openshift] Updating deployment/flask-app\nPipelineRun completed successfully.",
"oc apply -f tekton/triggers/rbac.yaml":"serviceaccount/pipeline configured\nrole.rbac.authorization.k8s.io/tekton-triggers-role configured\nrolebinding.rbac.authorization.k8s.io/tekton-triggers-binding configured",
"oc apply -f tekton/triggers/triggerbinding.yaml":"triggerbinding.triggers.tekton.dev/github-binding configured",
"oc apply -f tekton/triggers/triggertemplate.yaml":"triggertemplate.triggers.tekton.dev/github-template configured",
"oc apply -f tekton/triggers/eventlistener.yaml":"eventlistener.triggers.tekton.dev/github-eventlistener configured",
"oc apply -f tekton/triggers/route.yaml":"route.route.openshift.io/github-eventlistener configured",
"oc get eventlistener,triggerbinding,triggertemplate,route":"NAME                                                  ADDRESS\nel.triggers.tekton.dev/github-eventlistener           http://el-github-eventlistener.tekton-lab.svc.cluster.local:8080\n\nNAME                                                   AGE\ntriggerbinding.triggers.tekton.dev/github-binding      2m\ntriggertemplate.triggers.tekton.dev/github-template    2m\nroute.route.openshift.io/github-eventlistener          github-eventlistener-tekton-lab.apps-crc.testing",
"oc port-forward svc/el-github-eventlistener 8080:8080":"Forwarding from 127.0.0.1:8080 -> 8080\nForwarding from [::1]:8080 -> 8080",
"ngrok http 8080":"Session Status: online\nForwarding: https://example-ngrok-free.app -> http://localhost:8080",
"oc get pipelinerun --sort-by=.metadata.creationTimestamp":"NAME                         SUCCEEDED   REASON      STARTTIME\nflask-app-github-run-x7k9p   True        Succeeded   20s\nflask-app-run                True        Succeeded   8m",
"oc logs deployment/flask-app":" * Serving Flask app 'app'\n * Running on http://0.0.0.0:8080\n127.0.0.1 - - [GET / HTTP/1.1] 200 -\n127.0.0.1 - - [GET /health HTTP/1.1] 200 -",
"oc describe pod flask-app":"Name: flask-app-7f9dd7d6f8-xk2bp\nNamespace: tekton-lab\nStatus: Running\nConditions:\n  Ready True\n  ContainersReady True\nEvents:\n  Normal  Scheduled  Successfully assigned tekton-lab/flask-app to crc-xxxxx-master-0\n  Normal  Pulled     Container image already present on machine\n  Normal  Created    Created container flask-app\n  Normal  Started    Started container flask-app",
"oc describe route flask-app":"Name: flask-app\nNamespace: tekton-lab\nHost: flask-app-tekton-lab.apps-crc.testing\nPath: <none>\nService: flask-app (weight 100)\nPort: 8080\nTLS Termination: edge",
"oc rollout status deployment/flask-app":"Waiting for deployment \"flask-app\" rollout to finish: 1 old replicas are pending termination...\ndeployment \"flask-app\" successfully rolled out"
};
function rootPath(){return location.pathname.includes('/chapters/')?'../':''}
function chapterPath(i){return rootPath()+'chapters/'+OEA_MODULES[i][1]}
function homePath(){return rootPath()+'index.html'}
function getCurrent(){return Number(document.body.dataset.module||0)}
function getName(){return localStorage.getItem('oea_name')||''}
function getCompleted(){try{return JSON.parse(localStorage.getItem('oea_completed')||'[]')}catch(e){return []}}
function setCompleted(arr){localStorage.setItem('oea_completed',JSON.stringify([...new Set(arr)]))}
function renderSidebar(){const current=getCurrent();const box=document.getElementById('sideModules');if(!box)return;const comp=getCompleted();box.innerHTML=OEA_MODULES.map((m,i)=>`<a class="module-open" href="${chapterPath(i)}"><button class="module ${i===current?'active':''} ${comp.includes(i)?'done':''}"><span>${i<5?'▣':'›_'}</span><span>${i+1}. ${m[0]}</span><small>${comp.includes(i)?'●':'▣'}</small></button></a>`).join('');updateProgress()}
function updateProgress(){const comp=getCompleted();const current=getCurrent();const pct=Math.max(7,Math.round((comp.length/OEA_MODULES.length)*100));['sideBar'].forEach(id=>{const e=document.getElementById(id); if(e)e.style.width=pct+'%'}); const pctText=document.getElementById('pctText'); if(pctText)pctText.textContent=pct+'%'; const mc=document.getElementById('moduleCounter'); if(mc)mc.textContent=`Módulo ${current+1} de ${OEA_MODULES.length}`; const cp=document.getElementById('circlePct'); if(cp)cp.textContent=pct+'%'; const dc=document.getElementById('doneCount'); if(dc)dc.textContent=comp.length; const pc=document.getElementById('pendCount'); if(pc)pc.textContent=OEA_MODULES.length-comp.length;}
function saveName(){const i=document.getElementById('studentName'); const v=(i?i.value:'').trim(); if(!v){alert('Digite seu nome completo para liberar a trilha.');return} localStorage.setItem('oea_name',v); renderIdentity()}
function logout(){localStorage.removeItem('oea_name');renderIdentity()}
function renderIdentity(){const n=getName(); const top=document.getElementById('userTop'); if(top)top.textContent=n?'👤 '+n:'👤 Visitante'; const g=document.getElementById('guestBox'), l=document.getElementById('loggedBox'), h=document.getElementById('helloName'); if(g&&l){g.classList.toggle('hidden',!!n); l.classList.toggle('hidden',!n); if(h)h.textContent='Olá, '+(n||'Aluno')+'!'} if(typeof renderCertificate==='function') renderCertificate();}
function markModule(i){const comp=getCompleted(); if(!comp.includes(i)){comp.push(i);setCompleted(comp)} updateProgress(); const msg=document.getElementById('doneMsg'); if(msg){msg.style.display='block'; msg.textContent='✓ Capítulo marcado como concluído.'}}
function goNext(){let n=Math.min(getCurrent()+1,OEA_MODULES.length-1); location.href=chapterPath(n)}
function goPrev(){let n=Math.max(getCurrent()-1,0); location.href=chapterPath(n)}
function cmd(c){const t=document.getElementById('terminal'); if(!t)return; t.innerHTML += `<span class="prompt">\nuser@openshift:~$</span> ${c}\n${outputs[c]||'Comando simulado não cadastrado ainda.'}\n<span class="prompt">user@openshift:~$</span> `; t.scrollTop=t.scrollHeight;}
function clearTerm(){const t=document.getElementById('terminal'); if(t)t.innerHTML='<span class="prompt">user@openshift:~$</span> ';}
function copyText(txt){navigator.clipboard&&navigator.clipboard.writeText(txt);}
function runStep(cmdText,el){cmd(cmdText); if(el){el.parentElement.querySelector('.status-msg').style.display='block';}}
function init(){renderSidebar();renderIdentity();updateProgress(); const tt=document.getElementById('topTitle'); if(tt)tt.textContent=OEA_MODULES[getCurrent()][0];}
document.addEventListener('DOMContentLoaded',init);


/* v2.2.1 FIX - robust terminal/copy/buttons */
function _oeaTerminal(){ return document.getElementById('terminal'); }
function _oeaEscape(s){ return String(s).replace(/[&<>]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[ch])); }
function cmd(c){
  const t=_oeaTerminal();
  if(!t){ alert('Terminal não encontrado nesta página.'); return; }
  const out=(typeof outputs==='object' && outputs[c]) ? outputs[c] : 'Comando simulado não cadastrado ainda.';
  t.innerHTML += `<span class="prompt">\nuser@openshift:~$</span> ${_oeaEscape(c)}\n${_oeaEscape(out)}\n<span class="prompt">user@openshift:~$</span> `;
  t.scrollTop=t.scrollHeight;
}
function clearTerm(){
  const t=_oeaTerminal();
  if(t) t.innerHTML='<span class="prompt">user@openshift:~$</span> ';
}
function copyText(txt){
  if(navigator.clipboard && window.isSecureContext){
    navigator.clipboard.writeText(txt).then(()=>{}).catch(()=>_fallbackCopy(txt));
  } else {
    _fallbackCopy(txt);
  }
}
function openConsoleMock(){
  const box=document.getElementById('consoleMock');
  if(!box) return;
  box.classList.remove('hidden');
  const body=box.querySelector('.browser-mock-body');
  const login=document.getElementById('ocLoginScreen');
  const console_=document.getElementById('ocConsoleScreen');
  if(login) login.classList.remove('hidden');
  if(console_) console_.classList.add('hidden');
  if(body){
    body.classList.add('loading');
    setTimeout(()=>{ body.classList.remove('loading'); }, 650);
  }
  try{ box.scrollIntoView({behavior:'smooth', block:'nearest'}); }catch(e){}
}
function consoleMockLogin(){
  const box=document.getElementById('consoleMock');
  if(!box) return;
  box.classList.remove('hidden');
  const login=document.getElementById('ocLoginScreen');
  const console_=document.getElementById('ocConsoleScreen');
  if(login) login.classList.add('hidden');
  if(console_) console_.classList.remove('hidden');
  const badge=document.getElementById('consoleUserBadge');
  if(badge) badge.innerHTML='<span class="dot"></span> kube:admin';
  oeaConsoleToast('✓ Login realizado com sucesso');
}
function consoleMockValidate(){
  oeaConsoleToast('✓ oc whoami → kubeadmin');
}
function oeaConsoleToast(msg){
  const box=document.getElementById('consoleMock');
  if(!box) return;
  let toast=box.querySelector('.oc-toast');
  if(!toast){
    toast=document.createElement('div');
    toast.className='oc-toast';
    box.querySelector('.browser-mock-body').appendChild(toast);
  }
  toast.textContent=msg;
  toast.classList.add('show');
  clearTimeout(window._ocToastTimer);
  window._ocToastTimer=setTimeout(()=>toast.classList.remove('show'), 2200);
}
function openAppPreview(){
  const box=document.getElementById('appPreview');
  if(!box) return;
  box.classList.remove('hidden');
  const body=box.querySelector('.browser-mock-body');
  if(body){
    body.classList.add('loading');
    setTimeout(()=>{ body.classList.remove('loading'); }, 700);
  }
  try{ box.scrollIntoView({behavior:'smooth', block:'nearest'}); }catch(e){}
}
function runPipelineViz(){
  const box=document.getElementById('pipelineViz');
  if(!box) return;
  box.classList.remove('hidden');
  const status=document.getElementById('pipelineVizStatus');
  const tasks=['task-clone','task-build','task-deploy'];
  tasks.forEach(id=>{
    const t=document.getElementById(id);
    if(t){ t.classList.remove('running','success'); t.querySelector('.task-icon').textContent='○'; }
  });
  if(status){ status.classList.remove('done'); status.textContent='Iniciando PipelineRun...'; }
  try{ box.scrollIntoView({behavior:'smooth', block:'nearest'}); }catch(e){}

  let i=0;
  function step(){
    if(i>0){
      const prev=document.getElementById(tasks[i-1]);
      if(prev){ prev.classList.remove('running'); prev.classList.add('success'); prev.querySelector('.task-icon').textContent='✓'; }
    }
    if(i>=tasks.length){
      if(status){ status.classList.add('done'); status.textContent='✓ PipelineRun Succeeded'; }
      return;
    }
    const cur=document.getElementById(tasks[i]);
    if(cur){ cur.classList.add('running'); }
    if(status){ status.textContent='Executando: '+tasks[i].replace('task-','')+'...'; }
    i++;
    setTimeout(step, 900);
  }
  setTimeout(step, 300);
}
function runTopologyViz(){
  const box=document.getElementById('topologyViz');
  if(!box) return;
  box.classList.remove('hidden');
  const status=document.getElementById('topologyVizStatus');
  const nodes=['topo-pipeline','topo-deploy','topo-pod','topo-svc','topo-route'];
  nodes.forEach(id=>{ const n=document.getElementById(id); if(n) n.classList.remove('checked'); });
  if(status){ status.classList.remove('done'); status.textContent='Verificando objetos...'; }
  try{ box.scrollIntoView({behavior:'smooth', block:'nearest'}); }catch(e){}

  let i=0;
  function step(){
    if(i>=nodes.length){
      if(status){ status.classList.add('done'); status.textContent='✓ Todos os objetos saudáveis — fluxo completo validado'; }
      return;
    }
    const n=document.getElementById(nodes[i]);
    if(n) n.classList.add('checked');
    if(status){ status.textContent='Validado: '+nodes[i].replace('topo-',''); }
    i++;
    setTimeout(step, 450);
  }
  setTimeout(step, 250);
}
function _fallbackCopy(txt){

  const ta=document.createElement('textarea');
  ta.value=txt; document.body.appendChild(ta); ta.select();
  try{ document.execCommand('copy'); }catch(e){}
  document.body.removeChild(ta);
}
function runStep(cmdText,el){
  cmd(cmdText);
  if(el){
    const row=el.closest('.run-row');
    if(row){
      const msg=row.querySelector('.status-msg');
      if(msg) msg.style.display='inline-block';
    }
  }
}


/* v2.2.2 - terminal input line */
function terminalInputEl(){
  return document.getElementById('terminalInput');
}
function fillCommand(commandText){
  const input = terminalInputEl();
  if(input){
    input.value = commandText;
    input.focus();
  } else {
    cmd(commandText);
  }
}
function runTerminalInput(){
  const input = terminalInputEl();
  if(!input) return;
  const commandText = input.value.trim();
  if(!commandText){
    input.focus();
    return;
  }
  cmd(commandText);
  input.value = '';
  input.focus();
}
function terminalInputKey(event){
  if(event.key === 'Enter'){
    event.preventDefault();
    runTerminalInput();
  }
}
