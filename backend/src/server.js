import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { checkReminders } from './services/notificationService.js';

import authRoutes from './routes/authRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import revenueRoutes from './routes/revenueRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import fileRoutes from './routes/fileRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

connectDB();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('join:kanban', () => socket.join('kanban'));
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'AI Agency CRM API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/files', fileRoutes);

app.use(errorHandler);

setInterval(checkReminders, 60 * 60 * 1000);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
