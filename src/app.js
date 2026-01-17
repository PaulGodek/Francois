// ---------------- Backend Logic ----------------




import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import mongoose from 'mongoose';


// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9000;

// Connect to MongoDB
const dbURI = process.env.CONN_STR;

mongoose.connect(dbURI).then(() => {
  console.log('✅ Connected to MongoDB successfully');
}).catch(err => {
  console.log('❌ MongoDB connection error: ', err);
});

app.use(express.json());


// Routes
import taskRoutes from './routes/taskRoutes.js';

app.use('/api/tasks', taskRoutes);




// ---------------- INITIALISATION ----------------




// Serve static files from the 'src/public' directory to make them publicaly accessible
app.use('/public', express.static(path.join(__dirname, 'public')));

// Startup Frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Startup Backend
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});