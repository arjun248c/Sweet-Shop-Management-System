import app from './app';
import { initializeDatabase } from './database';

// Initialize DB (Fire and forget, or handle better?)
// In serverless, we might re-use frozen connections.
// initializeDatabase checks if pool exists.
initializeDatabase().catch(err => console.error('DB Init Failed:', err));

export default app;
