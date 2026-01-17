import Task from '../models/Task.js';

// ---------------- CRUD Operations ----------------

export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
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