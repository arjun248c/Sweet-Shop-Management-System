import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './database';
import authRoutes from './routes/auth';
import sweetsRoutes from './routes/sweets';

const app = express();

app.use(cors());
app.use(express.json());

// Initialize DB (only if not in test mode, or handle differently)
if (process.env.NODE_ENV !== 'test') {
    initializeDatabase();
}

app.use('/api/auth', authRoutes);
app.use('/api/sweets', sweetsRoutes);

export default app;
