import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import prisma from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Test DB Connection
async function startServer() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
    
    app.use(cors());
    app.use(express.json());

    app.use('/api/auth', authRoutes);
    app.use('/api/projects', projectRoutes);
    app.use('/api/tasks', taskRoutes);
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/analytics', analyticsRoutes);

    // Serve static frontend in production
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    app.use(express.static(path.join(__dirname, '../../frontend/dist')));

    app.use((req, res) => {
      res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  }
}

startServer();
