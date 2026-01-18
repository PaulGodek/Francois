import Task from '../models/Task.js';

// ---------------- CRUD Operations ----------------

export const getTasks = async (req, res) => {
  const { statut, priorite, categorie, etiquettes, avant, apres, q, tri, order } = req.query;
  
  let pipeline = [];

  // match part of the pipeline
  let match = { $match: {}};

  if (typeof statut !== "undefined") {
    match.$match.statut = statut;
  } 

  if (typeof priorite !== "undefined") {
    match.$match.priorite = priorite;
  } 

  if (typeof categorie !== "undefined") {
    match.$match.categorie = categorie;
  } 

  if (typeof etiquettes !== "undefined") {
    match.$match.etiquettes = etiquettes;
  } 

  if (typeof avant !== "undefined") {
    const date = new Date(avant);
    match.$match.echeance = { $lt: date };
  } 

  if (typeof apres !== "undefined") {
    const date = new Date(apres);
    match.$match.echeance = { $gt: date };
  } 

  if (typeof q !== "undefined") {
    const searchTerm = q;
    match.$match.$or = [
      { titre: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } }
    ];
  }

  // if there are any matchs for filtering
  if (match.$match != {}) {
    pipeline.push(match);
  }

  // sort part of the pipeline
  if (typeof tri !== "undefined") {
    let finalOrder = order === 'desc' ? -1 : 1;
    switch (tri) {
      case 'echeance':
        pipeline.push({ $sort: { echeance: finalOrder }});
        break;
      case 'priorite':
        pipeline.push({ $sort: { priorite: finalOrder } });
        break;
      case 'dateCreation':
        pipeline.push({ $sort: { dateCreation: finalOrder } });
        break;
      default:
        break;
    }
  }

  try {
    let tasks = await Task.aggregate(pipeline);
    res.status(200).json(tasks);
  } catch (err) {
    res.status(400).json({ error: info + "      " + err.message });
  }
}

export const getTaskById = async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findById(id);
    res.status(200).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export const createTask = async (req, res) => {
  const { titre, description, statut, priorite, echeance, categorie, etiquettes, sousTaches, commentaires } = req.body;
  try {
    const newTask = await Task.create({ 
      titre, 
      description, 
      statut, 
      priorite, 
      echeance, 
      categorie, 
      etiquettes, 
      sousTaches, 
      commentaires 
    });
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export const updateTask = async (req, res) => {
  const { id } = req.params;
  const { titre, description, statut, priorite, echeance, categorie, etiquettes, sousTaches, commentaires } = req.body;
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      id, 
      { titre, description, statut, priorite, echeance, categorie, etiquettes, sousTaches, commentaires }, 
      { new: true }
    );
    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export const deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedTask = await Task.findByIdAndDelete(id);
    res.status(204).json(deletedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
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