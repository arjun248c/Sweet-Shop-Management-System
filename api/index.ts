import app from '../backend/src/app';
import { initializeDatabase } from '../backend/src/database';

// Initialize database connection (idempotent)
initializeDatabase().catch(err => console.error('DB Init Failed:', err));

export default app;
