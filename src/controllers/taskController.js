import Task from '../models/Task.js';

// ---------------- CRUD Operations ----------------

export const getTasks = async (req, res) => {
  const { statut, priorite, categorie, etiquette, avant, apres, q, tri, order } = req.query;
  
  let match = {};

  if (statut !== undefined) {
    match = { statut };
  } 
  else if (priorite !== undefined) {
    match = { priorite };
  } 
  else if (categorie !== undefined) {
    match = { categorie };
  } 
  else if (etiquette !== undefined) {
    match = { etiquettes: etiquette };
  } 
  else if (avant !== undefined) {
    const date = new Date(avant);
    match = { echeance: { $lt: date } };
  } 
  else if (apres !== undefined) {
    const date = new Date(apres);
    match = { echeance: { $gt: date } };
  } 
  else if (q !== undefined) {
    const searchTerm = q;
    match = {
      $or: [
        { titre: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ]
    };
  }

  let pipeline = [{ $match: match }];

  if (tri !== undefined) {
    let sortOrder = order === 'desc' ? -1 : 1;
    switch (tri) {
      case 'echeance':
        pipeline.push({ $sort: { echeance: sortOrder } });
        break;
      case 'priorite':
        pipeline.push({ $sort: { priorite: sortOrder } });
        break;
      case 'dateCreation':
        pipeline.push({ $sort: { dateCreation: sortOrder } });
        break;
      default:
        break;
    }
  }

  try {
    let tasks = await Task.aggregate(pipeline);
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
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