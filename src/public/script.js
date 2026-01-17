



// ------------- Frontend Logic ----------------




const taskList = document.getElementById('taskList');
const addBtn = document.getElementById('addTaskBtn');
const searchInput = document.getElementById('search');
const modal = document.getElementById('modal');
const taskForm = document.getElementById('taskForm');
const modalTitle = document.getElementById('modalTitle');
const closeModalBtn = document.getElementById('closeModal');
const deleteTaskBtn = document.getElementById('deleteTask');
const subtasksDiv = document.getElementById('subtasks');
const addSubtaskBtn = document.getElementById('addSubtask');
const commentsDiv = document.getElementById('comments');
const addCommentBtn = document.getElementById('addComment');
const newCommentInput = document.getElementById('newComment');
const taskDetail = document.getElementById('taskDetail');

const filterStatut = document.getElementById('filterStatut');
const filterPriorite = document.getElementById('filterPriorite');
const filterCategorie = document.getElementById('filterCategorie');
const filterEtiquette = document.getElementById('filterEtiquette');
const filterAvant = document.getElementById('filterAvant');
const filterApres = document.getElementById('filterApres');
const sortBy = document.getElementById('sortBy');
const sortOrder = document.getElementById('sortOrder');
const clearFilters = document.getElementById('clearFilters');

let tasks = [];
let editingId = null;

function loadTasks(){
  try{ tasks = JSON.parse(localStorage.getItem('tasks')||'null') || sampleTasks(); }catch(e){ tasks = sampleTasks(); }
}
function saveTasks(){ localStorage.setItem('tasks', JSON.stringify(tasks)); }

function sampleTasks(){
  return [
    { id: Date.now()-10000, titre:'Faire TP MongoDB', description:'CRUD sur collection tasks', dateCreation:new Date().toISOString(), echeance:'2025-03-31', statut:'en cours', priorite:'haute', categorie:'cours', etiquettes:['mongo','tp'], sousTaches:[], commentaires:[] },
    { id: Date.now()-5000, titre:'Rédiger rapport', description:'Rapport final du projet', dateCreation:new Date().toISOString(), echeance:'2025-04-05', statut:'à faire', priorite:'moyenne', categorie:'projet', etiquettes:['rapport'], sousTaches:[], commentaires:[] }
  ];
}

function comparePriority(a,b){ const map={basse:1,moyenne:2,haute:3,critique:4}; return (map[a]||0)-(map[b]||0); }

function applyFilters(list){
  const q = (searchInput.value||'').toLowerCase();
  return list.filter(t=>{
    if(filterStatut.value && t.statut!==filterStatut.value) return false;
    if(filterPriorite.value && t.priorite!==filterPriorite.value) return false;
    if(filterCategorie.value && !t.categorie?.toLowerCase().includes(filterCategorie.value.toLowerCase())) return false;
    if(filterEtiquette.value && !(t.etiquettes||[]).some(e=>e.toLowerCase().includes(filterEtiquette.value.toLowerCase()))) return false;
    if(filterAvant.value && t.echeance && t.echeance>filterAvant.value) return false;
    if(filterApres.value && t.echeance && t.echeance<filterApres.value) return false;
    if(q){ if(!(t.titre?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q))) return false; }
    return true;
  });
}

function applySort(list){
  const s = sortBy.value; const ord = sortOrder.value;
  return list.slice().sort((a,b)=>{
    let r=0;
    if(s==='echeance') r = (a.echeance||'').localeCompare(b.echeance||'');
    else if(s==='priorite') r = comparePriority(a.priorite,b.priorite);
    else r = (a.dateCreation||'').localeCompare(b.dateCreation||'');
    return ord==='asc'? r : -r;
  });
}

function renderTasks(){
  let list = applyFilters(tasks);
  list = applySort(list);
  taskList.innerHTML='';
  if(list.length===0){ taskList.innerHTML='<p>Aucune tâche</p>'; return; }
  list.forEach(t=>{
    const li = document.createElement('li'); li.className='task-card';
    li.innerHTML = `
      <div>
        <h3>${escapeHtml(t.titre)}</h3>
        <div class="task-meta">${escapeHtml(t.categorie||'')} • ${escapeHtml(t.statut)} • <strong>${escapeHtml(t.priorite)}</strong></div>
        <div class="task-meta">Échéance: ${escapeHtml(t.echeance||'—')}</div>
      </div>
      <div class="task-actions">
        <button class="open">🔍</button>
        <button class="edit">✏️</button>
        <button class="delete">✖</button>
      </div>
    `;
    li.querySelector('.open').onclick = ()=> renderDetail(t.id);
    li.querySelector('.edit').onclick = ()=> openModal(t.id);
    li.querySelector('.delete').onclick = ()=> { if(confirm('Supprimer cette tâche ?')){ tasks = tasks.filter(x=>x.id!==t.id); saveTasks(); renderTasks(); renderDetail(); } };
    taskList.appendChild(li);
  });
}

function renderDetail(id){
  if(!id){ taskDetail.innerHTML='<p class="empty">Sélectionnez une tâche pour voir les détails</p>'; return; }
  const t = tasks.find(x=>x.id===id); if(!t) return;
  taskDetail.innerHTML = '';
  const h = document.createElement('div');
  h.innerHTML = `
    <h2>${escapeHtml(t.titre)}</h2>
    <div class="task-meta">${escapeHtml(t.categorie||'')} • ${escapeHtml(t.statut)} • Priorité: ${escapeHtml(t.priorite)}</div>
    <p>${escapeHtml(t.description||'')}</p>
    <h4>Sous-tâches</h4>
  `;
  taskDetail.appendChild(h);
  const ul = document.createElement('ul'); ul.style.paddingLeft='18px';
  (t.sousTaches||[]).forEach(st=>{ const li=document.createElement('li'); li.textContent = `${st.titre} — ${st.statut} ${st.echeance? ' • '+st.echeance : ''}`; ul.appendChild(li); });
  taskDetail.appendChild(ul);
  const c = document.createElement('div'); c.innerHTML='<h4>Commentaires</h4>'; (t.commentaires||[]).forEach(cm=>{ const p=document.createElement('p'); p.innerHTML=`<strong>${escapeHtml(cm.auteur||'Anonyme')}</strong> <small style="color:var(--muted)">(${cm.date})</small><br>${escapeHtml(cm.contenu)}`; c.appendChild(p); });
  taskDetail.appendChild(c);
}

function openModal(id=null){
  editingId = id;
  modal.setAttribute('aria-hidden','false');
  modal.style.display='flex';
  subtasksDiv.innerHTML=''; commentsDiv.innerHTML=''; newCommentInput.value='';
  if(id){
    modalTitle.textContent='Modifier la tâche';
    const t = tasks.find(x=>x.id===id);
    document.getElementById('titre').value = t.titre||'';
    document.getElementById('description').value = t.description||'';
    document.getElementById('categorie').value = t.categorie||'';
    document.getElementById('etiquettes').value = (t.etiquettes||[]).join(',');
    document.getElementById('statut').value = t.statut||'à faire';
    document.getElementById('priorite').value = t.priorite||'moyenne';
    document.getElementById('echeance').value = t.echeance||'';
    (t.sousTaches||[]).forEach(st=> appendSubtask(st));
    (t.commentaires||[]).forEach(cm=> appendCommentUI(cm));
    deleteTaskBtn.style.display='inline-block';
  }else{
    modalTitle.textContent='Nouvelle tâche'; taskForm.reset(); deleteTaskBtn.style.display='none';
  }
}

function closeModal(){ editingId=null; modal.setAttribute('aria-hidden','true'); modal.style.display='none'; }

function appendSubtask(st={titre:'',statut:'à faire',echeance:''}){
  const div = document.createElement('div'); div.className='subtask row';
  div.innerHTML = `<input placeholder="Titre" value="${escapeAttr(st.titre)}"><select><option>à faire</option><option>en cours</option><option>terminée</option><option>annulée</option></select><input type="date" value="${escapeAttr(st.echeance)}"><button type="button" class="removeSub">✖</button>`;
  div.querySelector('select').value = st.statut||'à faire';
  div.querySelector('.removeSub').onclick = ()=>div.remove();
  subtasksDiv.appendChild(div);
}

function appendCommentUI(cm){
  const d = document.createElement('div'); d.className='comment'; d.innerHTML = `<strong>${escapeHtml(cm.auteur||'Anonyme')}</strong> <small style="color:var(--muted)">(${cm.date})</small><p>${escapeHtml(cm.contenu)}</p>`; commentsDiv.appendChild(d);
}

addBtn.onclick = ()=> openModal();
closeModalBtn.onclick = ()=> closeModal();
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });
addSubtaskBtn.onclick = ()=> appendSubtask();
addCommentBtn.onclick = ()=>{
  const text = newCommentInput.value.trim(); if(!text) return; appendCommentUI({auteur:'Vous',date:new Date().toLocaleString(),contenu:text}); newCommentInput.value='';
}

taskForm.onsubmit = function(e){
  e.preventDefault();
  const data = {
    titre: document.getElementById('titre').value.trim(),
    description: document.getElementById('description').value.trim(),
    categorie: document.getElementById('categorie').value.trim(),
    etiquettes: (document.getElementById('etiquettes').value||'').split(',').map(s=>s.trim()).filter(Boolean),
    statut: document.getElementById('statut').value,
    priorite: document.getElementById('priorite').value,
    echeance: document.getElementById('echeance').value,
    sousTaches: Array.from(subtasksDiv.querySelectorAll('.subtask')).map(div=>({
      titre: div.querySelector('input').value,
      statut: div.querySelector('select').value,
      echeance: div.querySelector('input[type=date]').value
    })),
    commentaires: Array.from(commentsDiv.querySelectorAll('.comment')).map(c=>({ auteur:'', date:'', contenu:c.querySelector('p')?c.querySelector('p').textContent:'' }))
  };
  if(editingId){
    const idx = tasks.findIndex(t=>t.id===editingId); if(idx>-1){ tasks[idx] = {...tasks[idx], ...data}; }
  }else{
    data.id = Date.now(); data.dateCreation = new Date().toISOString(); data.commentaires = [];
    tasks.push(data);
  }
  saveTasks(); renderTasks(); closeModal();
}

deleteTaskBtn.onclick = ()=>{
  if(!editingId) return; if(!confirm('Supprimer définitivement ?')) return; tasks = tasks.filter(t=>t.id!==editingId); saveTasks(); renderTasks(); closeModal(); renderDetail();
}

// Filters events
[searchInput,filterStatut,filterPriorite,filterCategorie,filterEtiquette,filterAvant,filterApres,sortBy,sortOrder].forEach(el=>el.addEventListener('input', renderTasks));
clearFilters.onclick = ()=>{ filterStatut.value=''; filterPriorite.value=''; filterCategorie.value=''; filterEtiquette.value=''; filterAvant.value=''; filterApres.value=''; sortBy.value='dateCreation'; sortOrder.value='asc'; searchInput.value=''; renderTasks(); };

function escapeHtml(s){ if(!s) return ''; return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }
function escapeAttr(s){ return (s||'').replaceAll('"','&quot;').replaceAll("'","&#39;"); }

loadTasks(); renderTasks(); renderDetail();
