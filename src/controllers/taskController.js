import Task from '../models/Task.js';

// ---------------- CRUD Operations ----------------

export const getTasks = async (req, res) => {
  const { query } = req.query;
  
  let match;

  if (typeof query.statut !== undefined) {
    match = { statut: query.statut };
  } 
  else if (typeof query.priorite !== undefined) {
    match = { priorite: query.priorite };
  } 
  else if (typeof query.categorie !== undefined) {
    match = { categorie: query.categorie };
  } 
  else if (typeof query.etiquette !== undefined) {
    match = { etiquettes: query.etiquette };
  } 
  else if (typeof query.avant !== undefined) {
    const date = new Date(query.avant);
    match = { echeance: { $lt: date } };
  } 
  else if (typeof query.apres !== undefined) {
    const date = new Date(query.apres);
    match = { echeance: { $gt: date } };
  } 
  else if (typeof query.q !== undefined) {
    const searchTerm = query.q;
    match = {
      $or: [
        { titre: { $regex: `/${searchTerm}/`, $options: 'i' } },
        { description: { $regex: `/${searchTerm}/`, $options: 'i' } }
      ]
    };
  } else {
    match = {};
  }

  let sort;

  if (typeof query.tri !== undefined) {
    let order = query.order === 'desc' ? -1 : 1;
    switch (query.tri) {
      case 'echeance':
        sort = { $sort: { echeance: order } };
        break;
      case 'priorite':
        sort = { $sort: { priorite: order } };
        break;
      case 'dateCreation':
        sort = { $sort: { dateCreation: order } };
        break;
      default:
        sort = {};
        break;
    }
  }

  try {
    let tasks = await Task.aggregate({$match: match, $sort: sort});
    res.status(200).json(tasks);
  } catch (err) {
    res.status(400).json({ error: err.message });
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
  const { titre, description, statut, priorite, echeance } = req.body;
  try {
    const newTask = await Task.create({ titre, description, statut, priorite, echeance });
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export const updateTask = async (req, res) => {
  const { id } = req.params;
  const { titre, description, statut, priorite, echeance } = req.body;
  try {
    const updatedTask = await Task.findByIdAndUpdate(id, { titre, description, statut, priorite, echeance }, { new: true });
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