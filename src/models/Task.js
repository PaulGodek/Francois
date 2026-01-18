import mongoose from 'mongoose';

// Setup Schemas for Mongoose
const taskSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: String,
  dateCreation: { type: Date, default: Date.now },
  echeance: Date,
  statut: String,
  priorite: String,
  categorie: String,
  etiquettes: [String],
  sousTaches: [{ titre: { type: String, required: true }, statut: String, echeance: Date }],
  commentaires: [{ date: { type: Date, default: Date.now }, contenu: String }],
});

export default mongoose.model('Tasks', taskSchema);