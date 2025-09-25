
const qs = (s,e=document)=>e.querySelector(s);
const qsa = (s,e=document)=>[...e.querySelectorAll(s)];
const storageKey = 'vl_profile_v1';

const GRADIENTS = [
  ['#7a5cff','#b08aff'], ['#00c9ff','#92fe9d'], ['#f83600','#f9d423'],
  ['#fc5c7d','#6a82fb'], ['#00dbde','#fc00ff'], ['#11998e','#38ef7d'],
  ['#f7971e','#ffd200'], ['#30cfd0','#330867'], ['#5ee7df','#b490ca'],
  ['#ee0979','#ff6a00'], ['#56ab2f','#a8e063'], ['#ff512f','#dd2476']
];

let state = {
  nome: '',
  cargo: '',
  squad: '',
  local: '',
  bio: '',
  linkedin: '',
  github: '',
  skills: ['Onboarding','Cultura Vivo','Comunicação'],
  publico: true,
  mentoria: false,
  avatarType: 'initials',       
  avatarGradient: GRADIENTS[0], 
  photoDataURL: ''              
};


function load(){
  try{
    const raw = localStorage.getItem(storageKey);
    if(raw){
      state = { ...state, ...JSON.parse(raw) };
    }
  }catch{}
}
function save(){
  localStorage.setItem(storageKey, JSON.stringify(state));
  toast('Perfil salvo!');
}
function toast(msg){
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = 'position:fixed;bottom:16px;right:16px;padding:10px 12px;border:1px solid #242a4a;border-radius:10px;background:#161a2b;color:#e8e9f4;z-index:9999';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),1800);
}

function applyAvatar(){
  const wrap = qs('#avatarPreview');
  const initialsEl = qs('#avatarInitials');
  const img = qs('#avatarImg');


  const [c1,c2] = state.avatarGradient;
  wrap.style.background = `linear-gradient(145deg, ${c1}, ${c2})`;

  if(state.avatarType === 'photo' && state.photoDataURL){
    wrap.classList.remove('is-initials');
    img.src = state.photoDataURL;
    img.alt = `Avatar de ${state.nome||'colaborador'}`;
  } else {
    wrap.classList.add('is-initials');
    const initials = (state.nome||'Vivo LevelUp').trim().split(/\s+/).map(p=>p[0]).slice(0,2).join('').toUpperCase();
    initialsEl.textContent = initials || 'VL';
  }
}

function renderSwatches(){
  const box = qs('#swatches');
  box.innerHTML = '';
  GRADIENTS.forEach((g,idx)=>{
    const sw = document.createElement('button');
    sw.className = 'swatch';
    sw.style.background = `linear-gradient(145deg, ${g[0]}, ${g[1]})`;
    sw.title = `Gradiente ${idx+1}`;
    sw.onclick = ()=>{ state.avatarGradient = g; applyAvatar(); calcCompleteness(); save(); };
    box.appendChild(sw);
  });
}
function renderSkills(){
  const wrap = qs('#skillsWrap');
  wrap.innerHTML = state.skills.map((s,i)=>`
    <span class="skill">${s}<button title="remover" data-i="${i}">✕</button></span>
  `).join('');
  wrap.querySelectorAll('button').forEach(b=>{
    b.onclick = ()=>{
      state.skills.splice(+b.dataset.i,1);
      renderSkills(); calcCompleteness(); save();
    };
  });
}

function calcCompleteness(){
  let score = 0;
  if(state.nome) score += 20;
  if(state.cargo) score += 15;
  if(state.squad) score += 10;
  if(state.bio && state.bio.length >= 40) score += 20;
  const links = [state.linkedin, state.github].filter(Boolean).length;
  if(links>=1) score += 15;
  if((state.avatarType==='photo' && state.photoDataURL) || state.avatarType==='initials') score += 10;
  if(state.skills.length >= 3) score += 10;
  score = Math.min(100, score);

  qs('#completePct').textContent = `${score}%`;
  qs('#completeBar').style.width = `${score}%`;
}

function fillForm(){
  qs('#inpNome').value = state.nome;
  qs('#inpCargo').value = state.cargo;
  qs('#inpSquad').value = state.squad;
  qs('#inpLocal').value = state.local;
  qs('#inpBio').value = state.bio;
  qs('#inpLinkedin').value = state.linkedin;
  qs('#inpGithub').value = state.github;
  qs('#chkPublic').checked = !!state.publico;
  qs('#chkMentoria').checked = !!state.mentoria;
  renderSkills();
  applyAvatar();
  calcCompleteness();
}

function bind(){
  const map = {
    '#inpNome':'nome','#inpCargo':'cargo','#inpSquad':'squad','#inpLocal':'local',
    '#inpBio':'bio','#inpLinkedin':'linkedin','#inpGithub':'github'
  };
  Object.entries(map).forEach(([sel,key])=>{
    qs(sel).addEventListener('input', (e)=>{
      state[key] = e.target.value;
      if(key==='nome') applyAvatar();
      calcCompleteness();
    });
  });

  qs('#chkPublic').addEventListener('change', e=>{ state.publico = e.target.checked; });
  qs('#chkMentoria').addEventListener('change', e=>{ state.mentoria = e.target.checked; });

  const addSkill = ()=>{
    const v = qs('#skillInput').value.trim();
    if(!v) return;
    if(!state.skills.includes(v)) state.skills.push(v);
    qs('#skillInput').value = '';
    renderSkills(); calcCompleteness();
  };
  qs('#btnAddSkill').onclick = addSkill;
  qs('#skillInput').addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); addSkill(); } });

  qs('#avatarInput').addEventListener('change', onFileSelected);
 
  const dz = qs('#dropzone');
  ;['dragenter','dragover'].forEach(ev=>dz.addEventListener(ev,(e)=>{ e.preventDefault(); dz.classList.add('drag'); }));
  ;['dragleave','drop'].forEach(ev=>dz.addEventListener(ev,(e)=>{ e.preventDefault(); dz.classList.remove('drag'); }));
  dz.addEventListener('drop', e=>{
    const file = e.dataTransfer.files?.[0];
    if(file) handleImageFile(file);
  });

  qs('#btnCamera').onclick = openCamera;
  qsa('[data-close="#camOverlay"]').forEach(btn=>btn.onclick=()=>closeOverlay('#camOverlay'));
  qs('#btnSnap').onclick = takeSnapshot;

  qs('#btnRemovePhoto').onclick = ()=>{
    state.photoDataURL = '';
    state.avatarType = 'initials';
    applyAvatar(); calcCompleteness(); save();
  };
  qs('#btnShuffle').onclick = ()=>{
    state.avatarGradient = GRADIENTS[Math.floor(Math.random()*GRADIENTS.length)];
    applyAvatar(); save();
  };

  renderSwatches();

  qs('#btnSave').onclick = ()=>{ save(); };
  qs('#profileForm').addEventListener('submit', (e)=>{ e.preventDefault(); save(); });


  qs('#btnReset').onclick = ()=>{
    localStorage.removeItem(storageKey);
    state = {
      nome: '', cargo: '', squad: '', local: '', bio: '',
      linkedin: '', github: '', skills: ['Onboarding','Cultura Vivo','Comunicação'],
      publico: true, mentoria: false,
      avatarType: 'initials', avatarGradient: GRADIENTS[0], photoDataURL: ''
    };
    fillForm(); save();
  };
}

function onFileSelected(e){
  const file = e.target.files?.[0];
  if(file) handleImageFile(file);
}
function handleImageFile(file){
  if(!file.type.startsWith('image/')){ toast('Envie uma imagem válida.'); return; }
  const reader = new FileReader();
  reader.onload = ()=>{
    state.photoDataURL = reader.result;
    state.avatarType = 'photo';
    applyAvatar(); calcCompleteness(); save();
  };
  reader.readAsDataURL(file);
}


let mediaStream = null;
function openOverlay(sel){ qs(sel).classList.add('open'); }
function closeOverlay(sel){ qs(sel).classList.remove('open'); if(sel==='#camOverlay') stopCamera(); }
function stopCamera(){ if(mediaStream){ mediaStream.getTracks().forEach(t=>t.stop()); mediaStream=null; } }

async function openCamera(){
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    toast('Câmera não suportada neste navegador.');
    return;
  }
  try{
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    const video = qs('#camVideo');
    video.srcObject = mediaStream;
    openOverlay('#camOverlay');
  }catch(e){
    toast('Não foi possível acessar a câmera.');
  }
}

function takeSnapshot(){
  const video = qs('#camVideo');
  const canvas = qs('#camCanvas');
  const w = video.videoWidth, h = video.videoHeight;
  if(!w || !h){ toast('Câmera não pronta.'); return; }
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, w, h);
  const data = canvas.toDataURL('image/jpeg', 0.9);
  state.photoDataURL = data;
  state.avatarType = 'photo';
  applyAvatar(); calcCompleteness(); save();
  closeOverlay('#camOverlay');
}


load();
document.addEventListener('DOMContentLoaded', ()=>{
  fillForm();
  bind();
});
