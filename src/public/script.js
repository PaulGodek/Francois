



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
let currentDetailId = null;

// Variables de tri
let nomTri = "";
let valeurTri = "";
let orderAscendant = true;
// filtres de la forme { statut = "à faire", priorite = "basse" }
let filtres = {};

function changeTri(newNomTri, newValeurTri) {
  nomTri = newNomTri;
  valeurTri = newValeurTri
}

function suppressTri() {
  nomTri = "";
  valeurTri = ""
}

function getId(obj){
  if(!obj) return null;
  if(obj._id) return String(obj._id);
  if(obj.id) return String(obj.id);
  return null;
}

async function loadTasksAPI(){
  try {
    let url = "/api/tasks";
    let mediaQuery = "?";

    if (nomTri !== "") {
      mediaQuery += `${nomTri}=${valeurTri}&order=${orderAscendant?"asc":"desc"}&`;
    }

    for (const [key, value] of Object.entries(filtres)) {
      mediaQuery += `${key}=${value}&`;
    }

    let urlFinal = url;
    if (mediaQuery != "?")
      urlFinal += mediaQuery;

    const response = await fetch(urlFinal);
    if (!response.ok) throw new Error('Erreur lors du chargement des tâches');
    tasks = await response.json();
  } catch (error) {
    console.error('Erreur:', error);
    tasks = [];
  }
}

async function createTaskAPI(data) {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Erreur lors de la création');
  return await response.json();
}

async function updateTaskAPI(id, data) {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Erreur lors de la mise à jour');
  return await response.json();
}

async function deleteTaskAPI(id) {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Erreur lors de la suppression');
}

function renderTasks(){
  taskList.innerHTML='';
  if(tasks.length===0){ taskList.innerHTML='<p>Aucune tâche</p>'; return; }
  tasks.forEach(t=>{
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
      const tid = getId(t);
      li.querySelector('.open').onclick = ()=> renderDetail(tid);
      li.querySelector('.edit').onclick = ()=> openModal(tid);
      li.querySelector('.delete').onclick = async ()=> { 
        if(confirm('Supprimer cette tâche ?')){ 
          try {
            await deleteTaskAPI(tid);
            await loadTasks(); 
            if(currentDetailId && currentDetailId === tid){
              renderDetail();
            } else if(currentDetailId){
              renderDetail(currentDetailId);
            } else {
              renderDetail();
            }
          } catch (error) {
            alert('Erreur lors de la suppression: ' + error.message);
          }
        }
      };
    taskList.appendChild(li);
  });
}

async function loadTasks() {
  await loadTasksAPI();
  renderTasks();
}

function renderDetail(id){
  if(!id){ currentDetailId = null; taskDetail.innerHTML='<p class="empty">Sélectionnez une tâche pour voir les détails</p>'; return; }
  const sid = String(id);
  const t = tasks.find(x=> getId(x)===sid );
  if(!t){ currentDetailId = null; taskDetail.innerHTML='<p class="empty">Sélectionnez une tâche pour voir les détails</p>'; return; }
  currentDetailId = sid;
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
    const t = tasks.find(x=> getId(x)===String(id));
    if(!t){ modalTitle.textContent='Modifier la tâche'; deleteTaskBtn.style.display='inline-block'; return; }
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

taskForm.onsubmit = async function(e){
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
  try {
    let savedId = null;
    if(editingId){
      await updateTaskAPI(editingId, data);
      savedId = String(editingId);
    }else{
      const newTask = await createTaskAPI(data);
      savedId = getId(newTask);
    }
    await loadTasks(); 
    closeModal();
    if(savedId){
      const exists = tasks.find(x=> getId(x)===String(savedId));
      if(exists) renderDetail(savedId); else renderDetail();
    }
  } catch (error) {
    alert('Erreur: ' + error.message);
  }
}

deleteTaskBtn.onclick = async ()=>{
  if(!editingId) return; 
  if(!confirm('Supprimer définitivement ?')) return; 
  try {
    const deletedId = String(editingId);
    await deleteTaskAPI(deletedId);
    await loadTasks();
    closeModal(); 
      if(currentDetailId && currentDetailId === deletedId){
        renderDetail();
      } else if(currentDetailId){
        renderDetail(currentDetailId);
      } else {
        renderDetail();
      }
  } catch (error) {
    alert('Erreur lors de la suppression: ' + error.message);
  }
}

// Update filtering and ordering variables on input events
[searchInput, filterStatut, filterPriorite, filterCategorie, filterEtiquette, filterAvant, filterApres, sortBy, sortOrder].forEach(el => {
  el.addEventListener('input', () => {
    // Update sorting variables
    nomTri = sortBy.value || '';
    valeurTri = sortBy.value ? sortBy.options[sortBy.selectedIndex].text : '';
    orderAscendant = sortOrder.value === 'asc';

    // Update filters object
    filtres = {
      statut: filterStatut.value || undefined,
      priorite: filterPriorite.value || undefined,
      categorie: filterCategorie.value || undefined,
      etiquettes: filterEtiquette.value || undefined,
      avant: filterAvant.value || undefined,
      apres: filterApres.value || undefined,
      q: searchInput.value || undefined
    };

    // Remove undefined values from filters
    Object.keys(filtres).forEach(key => {
      if (filtres[key] === undefined) {
        delete filtres[key];
      }
    });

    // Reload tasks with updated variables
    loadTasks();
  });
});

clearFilters.onclick = ()=>{ 
  filterStatut.value=''; 
  filterPriorite.value=''; 
  filterCategorie.value=''; 
  filterEtiquette.value=''; 
  filterAvant.value=''; 
  filterApres.value=''; 
  sortBy.value='dateCreation'; 
  sortOrder.value='asc'; 
  searchInput.value=''; 

  nomTri = "";
  valeurTri = "";
  orderAscendant = true;
  filtres = {};

  loadTasks();
};

function escapeHtml(s){ if(!s) return ''; return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }
function escapeAttr(s){ return (s||'').replaceAll('"','&quot;').replaceAll("'","&#39;"); }

(async () => {
  await loadTasks();
  renderDetail();
})();
