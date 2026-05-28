import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { initializeDatabase } from './db/database';
import { seedDatabase } from './db/seed';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
const uploadDir = path.join(__dirname, '../../data/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Routes
import usersRouter from './routes/users';
import incidentsRouter from './routes/incidents';
import notesRouter from './routes/notes';
import weatherRouter from './routes/weather';
import ergRouter from './routes/erg';
import checklistRouter from './routes/checklist';
import exposureRouter from './routes/exposure';
import deconRouter from './routes/decon';
import resourcesRouter from './routes/resources';
import shippingPapersRouter from './routes/shippingPapers';
import markersRouter from './routes/markers';
import photosRouter from './routes/photos';

app.use('/api/users', usersRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/incidents', notesRouter);
app.use('/api/incidents', weatherRouter);
app.use('/api/erg', ergRouter);
app.use('/api/incidents', checklistRouter);
app.use('/api/incidents', exposureRouter);
app.use('/api/incidents', deconRouter);
app.use('/api/incidents', resourcesRouter);
app.use('/api/incidents', shippingPapersRouter);
app.use('/api/incidents', markersRouter);
app.use('/api/incidents', photosRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize DB and start server
async function start() {
  try {
    await initializeDatabase();
    console.log('Database initialized');
    await seedDatabase();
    console.log('Database ready');
  } catch (err) {
    console.error('Database initialization error:', err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`HazMat Scene Runner server running on port ${PORT}`);
  });
}

start();
