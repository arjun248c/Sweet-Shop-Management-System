import app from '../backend/src/app';
import { initializeDatabase } from '../backend/src/database';

// Initialize database on cold start
initializeDatabase().catch(err => {
    console.error('DB Init Failed:', err);
});

// Export the Express app directly for Vercel
export default app;
