
const MISSIONS = [
  { fase:1, titulo:'Assistir Cultura Vivo – Parte 1', colaborador:'Maria Clara', xp:10, status:'Em andamento', ultima:'Hoje, 10:12', deadline:'2025-05-02' },
  { fase:1, titulo:'Quiz Valores da Vivo', colaborador:'João Martins', xp:15, status:'Concluída', ultima:'Ontem', deadline:'—' },
  { fase:1, titulo:'Realizar 1:1 com gestor', colaborador:'Ana Souza', xp:25, status:'Pendente', ultima:'Há 3 dias', deadline:'2025-05-05' },
  { fase:1, titulo:'Tutorial Sistemas Internos', colaborador:'Diego Ramos', xp:20, status:'Em andamento', ultima:'Hoje, 09:02', deadline:'2025-05-04' },
  
  { fase:2, titulo:'Integração com Sistemas Legados', colaborador:'Paula Lima', xp:30, status:'Em andamento', ultima:'Hoje, 08:40', deadline:'2025-05-20' },
  { fase:2, titulo:'Shadowing com Gestor', colaborador:'Gustavo Neri', xp:15, status:'Pendente', ultima:'Há 1 dia', deadline:'2025-05-18' },
  { fase:2, titulo:'Treinamento Ferramentas Vivo', colaborador:'Bruna Torres', xp:20, status:'Concluída', ultima:'Hoje, 11:30', deadline:'—' },

  { fase:3, titulo:'Projeto de Melhoria Contínua', colaborador:'Marina Alves', xp:50, status:'Concluída', ultima:'Semana passada', deadline:'—' },
  { fase:3, titulo:'Apresentação para o Squad', colaborador:'Carlos Brito', xp:25, status:'Pendente', ultima:'Há 2 dias', deadline:'2025-05-30' },
  { fase:3, titulo:'Mentoria com Gestor', colaborador:'Larissa Nogueira', xp:20, status:'Em andamento', ultima:'Hoje, 10:05', deadline:'2025-05-28' }
];

let RECOMPENSAS = [
  { colaborador:'João Martins', recompensa:'Voucher iFood (R$ 25)', status:'Pendente' },
  { colaborador:'Bruna Torres', recompensa:'Camiseta Vivo', status:'Pendente' }
];

let FEEDBACKS = [
  { colaborador:'Maria Clara', titulo:'Feedback Final – Cultura Vivo', enviadoEm:'2025-05-01', status:'Aguardando' },
  { colaborador:'Diego Ramos', titulo:'Feedback Tutorial Sistemas', enviadoEm:'2025-05-02', status:'Aguardando' },
  { colaborador:'Paula Lima',  titulo:'Feedback Integração Legados', enviadoEm:'2025-05-02', status:'Aguardando' }
];

const REWARD_CATALOG = [
  'Voucher iFood (R$ 25)','Voucher iFood (R$ 50)','Voucher Amazon (R$ 50)','Day Off','Camiseta Vivo','Squeeze Vivo'
];
const BADGES = [
  'Primeiro Acesso','100% das Trilhas','Primeira Missão Concluída','Perfil Completo','Descobri o Glossário'
];

let currentPhase = 1;
let currentStatus = 'Todas';
let currentSearch = '';

const qs=(s,e=document)=>e.querySelector(s);
const qsa=(s,e=document)=>[...e.querySelectorAll(s)];
const fmtPct=n=>`${Math.round(n)}%`;
const uniqueCollaborators=()=>[...new Set(MISSIONS.map(m=>m.colaborador))];
const initials=name=>name.split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase();

const DEFAULT_SETTINGS = {
  defaultPhase: 1,
  defaultStatus: 'Todas',
  theme: 'dark', 
  compact: false,
  notify: false
};
function loadSettings(){ try{ const raw=localStorage.getItem('vl_settings'); return raw?{...DEFAULT_SETTINGS,...JSON.parse(raw)}:{...DEFAULT_SETTINGS}; }catch{ return {...DEFAULT_SETTINGS}; } }
function saveSettings(s){ localStorage.setItem('vl_settings', JSON.stringify(s)); }
function applyTheme(theme){
  const root=document.documentElement, body=document.body;
  const t = theme==='auto'
    ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light':'dark')
    : theme;
  if(t==='light'){ root.classList.add('light'); body.classList.add('light'); }
  else { root.classList.remove('light'); body.classList.remove('light'); }
}
function applyCompact(on){ document.querySelectorAll('.table-wrap, #view-trilhas .card').forEach(el=>el.classList.toggle('compact-rows', !!on)); }
let SETTINGS = loadSettings(); applyTheme(SETTINGS.theme); applyCompact(SETTINGS.compact);

const VIEWS = {
  overview: qs('#view-overview'),
  colabs: qs('#view-colabs'),
  trilhas: qs('#view-trilhas'),
  feedbacks: qs('#view-feedbacks'),
  recompensas: qs('#view-recompensas'),
  relatorios: qs('#view-relatorios'),
  config: qs('#view-config')
};
function setView(key){
  Object.values(VIEWS).forEach(v=>v.classList.remove('active'));
  VIEWS[key].classList.add('active');
  qsa('.nav a').forEach(a=>a.classList.toggle('active', a.dataset.view===key));
  const titles={overview:'Dashboard do Gestor',colabs:'Colaboradores',trilhas:'Trilhas & Missões',feedbacks:'Feedbacks',recompensas:'Recompensas & Badges',relatorios:'Relatórios',config:'Configurações'};
  qs('#pageTitle').textContent=titles[key]||'Vivo LevelUp';
  qs('#searchInput').value=''; currentSearch='';

  if(key==='colabs') renderColabs();
  if(key==='trilhas') renderAllMissions();
  if(key==='feedbacks') renderFeedbacksPage();
  if(key==='recompensas') { renderCatalogs(); renderAssigned(); }
  if(key==='relatorios') renderReportsPage();
  if(key==='config') enterConfigView();
}
qsa('#sideNav a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault(); setView(a.dataset.view);})); 

const tbody = qs('#missionsBody');
function statusClass(s){ return s==='Pendente' ? 'pend' : 'ok'; }
function filteredMissions(){
  return MISSIONS
    .filter(m=>m.fase===currentPhase)
    .filter(m=>currentStatus==='Todas'?true:m.status===currentStatus)
    .filter(m=>{ if(!currentSearch) return true; const key=(m.titulo+' '+m.colaborador).toLowerCase(); return key.includes(currentSearch.toLowerCase()); });
}
function renderOverviewTable(){
  tbody.innerHTML = filteredMissions().map(m=>`
    <tr>
      <td>${m.titulo}</td>
      <td>${m.colaborador}</td>
      <td>${m.xp}</td>
      <td><span class="status ${statusClass(m.status)}">${m.status}</span></td>
      <td>${m.ultima}</td>
      <td>${m.deadline}</td>
    </tr>`).join('') || `<tr><td colspan="6" style="text-align:center; color:var(--muted); padding:18px">Nenhuma missão.</td></tr>`;
  renderKPIs();
}
function renderKPIs(){
  const faseList=MISSIONS.filter(m=>m.fase===currentPhase);
  const doing=faseList.filter(m=>m.status==='Em andamento');
  const done=faseList.filter(m=>m.status==='Concluída');
  const xp=faseList.reduce((s,m)=>s+m.xp,0);
  qs('#kpiAtivos').textContent=new Set(MISSIONS.map(m=>m.colaborador)).size;
  qs('#kpiAndamento').textContent=doing.length;
  qs('#kpiXP').textContent=xp;
  qs('#kpiConclusao').textContent=fmtPct(faseList.length?done.length/faseList.length*100:0);

  const tec=Math.min(100, (done.length/(faseList.length||1))*100 + 5);
  const cul=Math.min(100, 70 + currentPhase*5);
  const soft=Math.min(100, 60 + currentPhase*2);
  qs('#progTec').style.width=tec+'%'; qs('#progTecTxt').textContent=fmtPct(tec);
  qs('#progCultura').style.width=cul+'%'; qs('#progCulturaTxt').textContent=fmtPct(cul);
  qs('#progSoft').style.width=soft+'%'; qs('#progSoftTxt').textContent=fmtPct(soft);

  qs('#feedbackCount').textContent=FEEDBACKS.filter(f=>f.status==='Aguardando').length;
  qs('#vouchersCount').textContent=RECOMPENSAS.filter(r=>r.status==='Pendente').length;
}
qsa('#phaseTabs .tab').forEach(t=>t.addEventListener('click',()=>{qsa('#phaseTabs .tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');currentPhase=+t.dataset.phase;renderOverviewTable();}));
qsa('#statusTabs .tab').forEach(t=>t.addEventListener('click',()=>{qsa('#statusTabs .tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');currentStatus=t.dataset.status;renderOverviewTable();}));
qs('#searchInput').addEventListener('input',e=>{currentSearch=e.target.value||'';renderOverviewTable();});

qs('#btnExport').addEventListener('click', ()=>{
  exportCSV(filteredMissions(), `missoes_fase${currentPhase}_${currentStatus.toLowerCase()}.csv`);
});
qs('#btnNovaMissao').addEventListener('click', ()=>{ fillColabSelect(); qs('#formTrilha').reset(); openOverlay('#trilhaOverlay'); });


qs('#btnReport').addEventListener('click', openReportModal);
qs('#btnReview').addEventListener('click', ()=>{ renderReviews(); openOverlay('#reviewOverlay'); });
qs('#btnRelease').addEventListener('click', ()=>{ renderRewardsToRelease(); openOverlay('#rewardsOverlay'); });


function openOverlay(id){ qs(id).classList.add('open'); }
function closeOverlay(id){ qs(id).classList.remove('open'); }
qsa('[data-close]').forEach(b=>b.addEventListener('click', ()=> closeOverlay(b.getAttribute('data-close'))));

function openReportModal(){
  const list=MISSIONS.filter(m=>m.fase===currentPhase);
  const done=list.filter(m=>m.status==='Concluída');
  const doing=list.filter(m=>m.status==='Em andamento');
  const pend=list.filter(m=>m.status==='Pendente');
  const xp=list.reduce((s,m)=>s+m.xp,0);
  qs('#reportPhase').textContent=currentPhase;
  qs('#repTotalMiss').textContent=list.length;
  qs('#repDone').textContent=done.length;
  qs('#repDoing').textContent=doing.length;
  qs('#repPending').textContent=pend.length;
  qs('#repXP').textContent=xp;
  qs('#repXPSpan').style.width=Math.min(100,(xp/200)*100)+'%';
  const rank={}; list.forEach(m=>rank[m.colaborador]=(rank[m.colaborador]||0)+m.xp);
  qs('#repTop').innerHTML=Object.entries(rank).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([n,px])=>`<li><strong>${n}</strong> — ${px} XP</li>`).join('')||'<li class="muted">Sem dados</li>';
  openOverlay('#reportOverlay');
}
qs('#btnExportReport').addEventListener('click', ()=> exportCSV(MISSIONS.filter(m=>m.fase===currentPhase), `relatorio_fase_${currentPhase}.csv`));

function renderRewardsToRelease(){
  const wrap=qs('#rewardsList'); const pend=RECOMPENSAS.filter(r=>r.status==='Pendente');
  wrap.innerHTML = pend.length?'':'<p class="muted">Não há recompensas pendentes.</p>';
  pend.forEach((r,i)=>{
    const row=document.createElement('div'); row.className='approval-row';
    row.innerHTML=`<div><strong>${r.colaborador}</strong><br><small class="muted">${r.recompensa}</small></div><div class="actions"><button class="btn primary" data-idx="${i}">Liberar</button></div>`;
    row.querySelector('button').addEventListener('click',e=>{RECOMPENSAS.filter(x=>x.status==='Pendente')[+e.target.dataset.idx].status='Liberado';renderRewardsToRelease();renderKPIs();renderAssigned();});
    wrap.appendChild(row);
  });
}

function renderReviews(){
  const wrap=qs('#reviewList'); const aguard=FEEDBACKS.filter(f=>f.status==='Aguardando');
  wrap.innerHTML= aguard.length?'':'<p class="muted">Sem feedbacks pendentes.</p>';
  aguard.forEach((f,i)=>{
    const row=document.createElement('div'); row.className='approval-row';
    row.innerHTML=`<div><strong>${f.colaborador}</strong><br><small class="muted">${f.titulo} • ${new Date(f.enviadoEm).toLocaleDateString()}</small></div>
    <div class="actions"><button class="btn" data-act="ajustes" data-idx="${i}">Pedir ajustes</button><button class="btn primary" data-act="aprovar" data-idx="${i}">Aprovar</button></div>`;
    row.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',e=>{
      const alvo=FEEDBACKS.filter(x=>x.status==='Aguardando')[+e.target.dataset.idx];
      if(!alvo) return; alvo.status=e.target.dataset.act==='aprovar'?'Aprovado':'Ajustes Solicitados';
      renderReviews(); renderKPIs(); renderFeedbacksPage();
    }));
    wrap.appendChild(row);
  });
}

const fillColabSelect=()=>{ qs('#colabSelect').innerHTML=uniqueCollaborators().map(n=>`<option>${n}</option>`).join(''); };
const fillVoucherColab=()=>{ qs('#voucherColab').innerHTML=uniqueCollaborators().map(n=>`<option>${n}</option>`).join(''); };
qs('#btnCriarTrilha').addEventListener('click',()=>{ fillColabSelect(); qs('#formTrilha').reset(); openOverlay('#trilhaOverlay'); });
qs('#btnAddMissaoList').addEventListener('click',()=>{ setView('trilhas'); fillColabSelect(); qs('#formTrilha').reset(); openOverlay('#trilhaOverlay'); });
qs('#btnAddColab').addEventListener('click',()=>{ qs('#formColab').reset(); openOverlay('#colabOverlay'); });
qs('#btnComunicado').addEventListener('click',()=>{ qs('#formCom').reset(); qs('#comLog').textContent=''; openOverlay('#comOverlay'); });
qs('#btnAddVoucher').addEventListener('click',()=>{ fillVoucherColab(); qs('#formVoucher').reset(); openOverlay('#voucherOverlay'); });

qs('#formTrilha').addEventListener('submit',e=>{
  e.preventDefault();
  const d=Object.fromEntries(new FormData(e.target).entries());
  MISSIONS.push({ fase:+d.fase, titulo:d.titulo.trim(), colaborador:d.colaborador, xp:+d.xp, status:'Pendente', ultima:'Agora', deadline:d.deadline||'—' });
  closeOverlay('#trilhaOverlay');
  currentPhase=+d.fase; qsa('#phaseTabs .tab').forEach(t=>t.classList.toggle('active',+t.dataset.phase===currentPhase));
  renderOverviewTable(); renderAllMissions();
});

qs('#formColab').addEventListener('submit',e=>{
  e.preventDefault();
  const {nome,missao,xp}=Object.fromEntries(new FormData(e.target).entries());
  MISSIONS.push({ fase:1, titulo:missao||'Primeiro Acesso', colaborador:nome.trim(), xp:+(xp||5), status:'Em andamento', ultima:'Agora', deadline:'—' });
  closeOverlay('#colabOverlay'); currentPhase=1;
  qsa('#phaseTabs .tab').forEach(t=>t.classList.toggle('active',+t.dataset.phase===1));
  renderOverviewTable(); renderColabs(); fillColabSelect(); fillVoucherColab();
});

qs('#formCom').addEventListener('submit',e=>{
  e.preventDefault();
  const d=Object.fromEntries(new FormData(e.target).entries());
  qs('#comLog').textContent=`Comunicado enviado a ${uniqueCollaborators().length} colaboradores às ${new Date().toLocaleTimeString()}.`;
  e.target.reset();
});

qs('#formVoucher').addEventListener('submit',e=>{
  e.preventDefault();
  const {colaborador,valor,descricao,expira}=Object.fromEntries(new FormData(e.target).entries());
  RECOMPENSAS.push({ colaborador, recompensa:`${descricao} (${valor})`, status:'Pendente', expira });
  closeOverlay('#voucherOverlay'); renderKPIs(); renderAssigned();
});


function renderColabs(){
  const grid=qs('#colabsGrid');
  const list=[...uniqueCollaborators()].sort();
  qs('#colabsCount').textContent = `${list.length} colaboradores`;
  grid.innerHTML = list.map(n=>`
    <div class="colab-card">
      <div class="avatar">${initials(n)}</div>
      <div class="meta"><div><strong>${n}</strong></div><small class="muted">${MISSIONS.filter(m=>m.colaborador===n).length} missões</small></div>
    </div>`).join('');
}


function renderAllMissions(){
  const body=qs('#allMissionsBody');
  body.innerHTML = MISSIONS.map(m=>`
    <tr>
      <td>Fase ${m.fase}</td>
      <td>${m.titulo}</td>
      <td>${m.colaborador}</td>
      <td>${m.xp}</td>
      <td><span class="status ${statusClass(m.status)}">${m.status}</span></td>
      <td>${m.deadline}</td>
    </tr>`).join('') || `<tr><td colspan="6" style="text-align:center; color:var(--muted); padding:18px">Sem missões.</td></tr>`;
}

function renderFeedbacksPage(){
  const wrap=qs('#feedbacksList');
  if(!FEEDBACKS.length){ wrap.innerHTML='<p class="muted">Sem feedbacks.</p>'; return; }
  wrap.innerHTML = FEEDBACKS.map(f=>`
    <div class="approval-row">
      <div><strong>${f.colaborador}</strong><br><small class="muted">${f.titulo} • ${new Date(f.enviadoEm).toLocaleDateString()}</small></div>
      <div class="actions"><span class="status ${f.status==='Aguardando'?'pend':'ok'}">${f.status}</span></div>
    </div>`).join('');
}


function renderCatalogs(){
  qs('#rewardsCatalog').innerHTML = REWARD_CATALOG.map(i=>`<li><span>${i}</span><span class="muted">Vivo</span></li>`).join('');
  qs('#badgesCatalog').innerHTML  = BADGES.map(i=>`<li><span class="badge-chip">🏅 ${i}</span><span class="muted">LevelUp</span></li>`).join('');
}
function renderAssigned(){
  const wrap=qs('#rewardsAssigned');
  const items = RECOMPENSAS.map(r=>`
    <div class="approval-row">
      <div><strong>${r.colaborador}</strong><br><small class="muted">${r.recompensa}${r.expira?` • expira ${r.expira}`:''}</small></div>
      <div class="actions"><span class="status ${r.status==='Pendente'?'pend':'ok'}">${r.status||'Atribuído'}</span></div>
    </div>`).join('');
  wrap.innerHTML = items || '<p class="muted">Nada atribuído ainda.</p>';
}
qs('#btnAtribuirPremio').addEventListener('click', ()=>{
  qs('#assignColab').innerHTML = uniqueCollaborators().map(n=>`<option>${n}</option>`).join('');
  fillAssignItems('recompensa'); openOverlay('#assignOverlay');
});
qs('#assignTipo').addEventListener('change', (e)=> fillAssignItems(e.target.value));
function fillAssignItems(tipo){
  const sel=qs('#assignItem'); const list = tipo==='badge'? BADGES : REWARD_CATALOG;
  sel.innerHTML = list.map(i=>`<option>${i}</option>`).join('');
}
qs('#formAssign').addEventListener('submit', e=>{
  e.preventDefault();
  const { tipo, colaborador, item } = Object.fromEntries(new FormData(e.target).entries());
  if(tipo==='badge'){ RECOMPENSAS.push({ colaborador, recompensa:`Badge: ${item}`, status:'Atribuído' }); }
  else{ RECOMPENSAS.push({ colaborador, recompensa:item, status:'Pendente' }); }
  closeOverlay('#assignOverlay'); renderAssigned(); renderKPIs();
});


function renderReportsPage(){
  const grid=qs('#reportsGrid');
  const makeCard = (title, subtitle, key) =>
    `<div class="report-card"><div><strong>${title}</strong></div><div class="muted" style="margin:6px 0">${subtitle}</div><div class="actions"><button class="btn" data-open="${key}">Abrir relatório</button></div></div>`;
  const sum=f=>{ const L=MISSIONS.filter(m=>f?m.fase===f:true); return {total:L.length, done:L.filter(m=>m.status==='Concluída').length, xp:L.reduce((s,m)=>s+m.xp,0)}; };
  const s1=sum(1), s2=sum(2), s3=sum(3), all=sum(null);
  grid.innerHTML =
    makeCard('Fase 1', `${s1.total} missões • ${s1.done} concluídas • ${s1.xp} XP`, 'fase-1') +
    makeCard('Fase 2', `${s2.total} missões • ${s2.done} concluídas • ${s2.xp} XP`, 'fase-2') +
    makeCard('Fase 3', `${s3.total} missões • ${s3.done} concluídas • ${s3.xp} XP`, 'fase-3') +
    makeCard('Consolidado', `${all.total} missões • ${all.done} concluídas • ${all.xp} XP`, 'all');
  qsa('[data-open]').forEach(btn=>btn.addEventListener('click',()=> openVisualReport(btn.getAttribute('data-open'))));
}
function openVisualReport(key){
  const fase = key==='all' ? null : Number(key.split('-')[1]);
  const lista = fase ? MISSIONS.filter(m=>m.fase===fase) : [...MISSIONS];
  const done  = lista.filter(m=>m.status==='Concluída').length;
  const doing = lista.filter(m=>m.status==='Em andamento').length;
  const pend  = lista.filter(m=>m.status==='Pendente').length;
  const xp    = lista.reduce((s,m)=>s+m.xp,0);
  const rank={}; lista.forEach(m=>rank[m.colaborador]=(rank[m.colaborador]||0)+m.xp );
  const top=Object.entries(rank).sort((a,b)=>b[1]-a[1]).slice(0,10);
  const tableRows = lista.slice().sort((a,b)=> (a.status>b.status?1:-1)).map(m=>`<tr><td>${m.fase?`Fase ${m.fase}`:''}</td><td>${m.titulo}</td><td>${m.colaborador}</td><td>${m.xp}</td><td>${m.status}</td><td>${m.deadline}</td></tr>`).join('');
  const title = fase ? `Relatório • Fase ${fase}` : 'Relatório • Consolidado';

  const w = window.open('', '_blank', 'width=1024,height=800');
  w.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8"/>
        <style>
          body{font-family:Inter, Arial, sans-serif;background:#0f1320;color:#e8e9f4;margin:0}
          .wrap{padding:24px}
          h1{margin:0 0 12px}
          .muted{color:#a6abcf}
          .grid{display:grid;grid-template-columns:repeat(12,1fr);gap:12px}
          .card{background:#161a2b;border:1px solid #242a4a;border-radius:12px;padding:12px}
          .span3{grid-column:span 3}.span12{grid-column:span 12}
          .bar{height:10px;border:1px solid #242a4a;border-radius:999px;overflow:hidden;background:#0d1120}
          .bar>span{display:block;height:100%;background:linear-gradient(90deg,#7a5cff,#b08aff)}
          table{width:100%;border-collapse:collapse}
          th,td{padding:8px 10px;border-bottom:1px solid #242a4a;text-align:left}
          .actions{display:flex;gap:8px;margin:10px 0}
          @media print{ .actions{display:none} body{background:white;color:black} .card{background:white;border-color:#ddd} .bar{border-color:#ddd;background:#eee} }
        </style>
      </head>
      <body>
        <div class="wrap">
          <h1>${title}</h1>
          <div class="muted">Gerado em ${new Date().toLocaleString()}</div>

          <div class="grid" style="margin-top:12px">
            <div class="card span3"><small>Total de Missões</small><h2>${lista.length}</h2></div>
            <div class="card span3"><small>Concluídas</small><h2>${done}</h2></div>
            <div class="card span3"><small>Em Andamento</small><h2>${doing}</h2></div>
            <div class="card span3"><small>Pendentes</small><h2>${pend}</h2></div>

            <div class="card span12">
              <small>XP total</small>
              <div class="bar" style="margin:8px 0 6px"><span style="width:${Math.min(100,(xp/300)*100)}%"></span></div>
              <div class="muted"><strong>${xp}</strong> XP somados</div>
            </div>

            <div class="card span12">
              <small>Top Colaboradores (por XP)</small>
              <ol>${top.map(([n,px])=>`<li><strong>${n}</strong> — ${px} XP</li>`).join('')}</ol>
            </div>

            <div class="card span12">
              <small>Missões (detalhe)</small>
              <table style="margin-top:8px">
                <thead><tr><th>Fase</th><th>Missão</th><th>Colaborador</th><th>XP</th><th>Status</th><th>Deadline</th></tr></thead>
                <tbody>${tableRows}</tbody>
              </table>
            </div>
          </div>

          <div class="actions">
            <button onclick="window.print()">Imprimir / PDF</button>
            <button id="copyBtn">Copiar resumo</button>
          </div>
        </div>
        <script>
          document.getElementById('copyBtn').onclick = () => {
            const texto = \`${title}\\nTotal: ${lista.length} | Concluídas: ${done} | Em andamento: ${doing} | Pendentes: ${pend} | XP: ${xp}\`;
            navigator.clipboard.writeText(texto); alert('Resumo copiado!');
          };
        <\/script>
      </body>
    </html>
  `);
  w.document.close();
}

function enterConfigView(){
  qs('#cfgDefaultPhase').value  = String(SETTINGS.defaultPhase);
  qs('#cfgDefaultStatus').value = SETTINGS.defaultStatus;
  qs('#cfgTheme').value         = SETTINGS.theme;
  qs('#cfgCompact').checked     = !!SETTINGS.compact;
  qs('#cfgNotify').checked      = !!SETTINGS.notify;
}
qs('#formConfig')?.addEventListener('submit',(e)=>{
  e.preventDefault();
  SETTINGS.defaultPhase  = Number(qs('#cfgDefaultPhase').value);
  SETTINGS.defaultStatus = qs('#cfgDefaultStatus').value;
  SETTINGS.theme         = qs('#cfgTheme').value;
  SETTINGS.compact       = qs('#cfgCompact').checked;
  SETTINGS.notify        = qs('#cfgNotify').checked;

  saveSettings(SETTINGS); applyTheme(SETTINGS.theme); applyCompact(SETTINGS.compact);

  currentPhase = SETTINGS.defaultPhase;
  currentStatus = SETTINGS.defaultStatus;
  qsa('#phaseTabs .tab').forEach(t=>t.classList.toggle('active', Number(t.dataset.phase)===currentPhase));
  qsa('#statusTabs .tab').forEach(t=>t.classList.toggle('active', t.dataset.status===currentStatus));
  renderOverviewTable();
  alert('Configurações salvas!');
});
qs('#btnResetCfg')?.addEventListener('click', ()=>{
  SETTINGS = {...DEFAULT_SETTINGS}; saveSettings(SETTINGS);
  enterConfigView(); applyTheme(SETTINGS.theme); applyCompact(SETTINGS.compact);
  currentPhase = SETTINGS.defaultPhase; currentStatus = SETTINGS.defaultStatus;
  qsa('#phaseTabs .tab').forEach(t=>t.classList.toggle('active', Number(t.dataset.phase)===currentPhase));
  qsa('#statusTabs .tab').forEach(t=>t.classList.toggle('active', t.dataset.status===currentStatus));
  renderOverviewTable();
});


function exportCSV(list, filename){
  const header=['Fase','Missão','Colaborador','XP','Status','Última Atualização','Deadline'].join(',');
  const rows=list.map(m=>[m.fase,m.titulo,m.colaborador,m.xp,m.status,m.ultima,m.deadline].join(','));
  const csv=[header,...rows].join('\n');
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
  a.download=filename; a.click();
}


currentPhase = SETTINGS.defaultPhase;
currentStatus = SETTINGS.defaultStatus;
qsa('#phaseTabs .tab').forEach(t=>t.classList.toggle('active', Number(t.dataset.phase)===currentPhase));
qsa('#statusTabs .tab').forEach(t=>t.classList.toggle('active', t.dataset.status===currentStatus));
renderOverviewTable();
