import express from 'express';
import cors from 'cors';
// import { initializeDatabase } from './database';
import authRoutes from './routes/auth';
import sweetsRoutes from './routes/sweets';
import orderRoutes from './routes/orders';

const app = express();

app.use(cors());
app.use(express.json());

// Initialize DB (use SQLite for local development)
if (process.env.NODE_ENV !== 'test') {
    // Use SQLite for local development
    const { initializeSQLiteDatabase } = require('./database-sqlite');
    initializeSQLiteDatabase();
}

app.use('/api/auth', authRoutes);
app.use('/api/sweets', sweetsRoutes);
app.use('/api/orders', orderRoutes);

// Serve Static Frontend (Production)
import path from 'path';
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

app.get('*', (req, res, next) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
        return next();
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
});

export default app;
