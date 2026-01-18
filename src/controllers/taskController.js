import Task from '../models/Task.js';

// ---------------- CRUD Operations ----------------

export const getAllTasks = async (req, res) => {
  try {
    const { statut, priorite, categorie, etiquette, avant, apres, q } = req.query;
    
    if (statut !== undefined) {
      const filteredTasks = await Task.find({ statut });
      return res.status(200).json(filteredTasks);
    } else if (priorite !== undefined) {
      const filteredTasks = await Task.find({ priorite });
      return res.status(200).json(filteredTasks);
    } else if (categorie !== undefined) {
      const filteredTasks = await Task.find({ categorie });
      return res.status(200).json(filteredTasks);
    } else if (etiquette !== undefined) {
      const filteredTasks = await Task.find({ etiquettes: etiquette });
      return res.status(200).json(filteredTasks);
    } else if (avant !== undefined) {
      const date = new Date(avant);
      const filteredTasks = await Task.find({ echeance: { $lt: date } });
      return res.status(200).json(filteredTasks);
    } else if (apres !== undefined) {
      const date = new Date(apres);
      const filteredTasks = await Task.find({ echeance: { $gt: date } });
      return res.status(200).json(filteredTasks);
    } else if (q !== undefined) {
      const filteredTasks = await Task.find({
        $or: [
          { titre: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } }
        ]
      });
      return res.status(200).json(filteredTasks);
    } else {
      const tasks = await Task.find();
      res.status(200).json(tasks);
    }
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