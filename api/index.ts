import { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../backend/src/app';
import { initializeDatabase } from '../backend/src/database';

let isInitialized = false;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Ensure database is initialized before handling requests
    if (!isInitialized) {
        try {
            await initializeDatabase();
            isInitialized = true;
        } catch (err) {
            console.error('DB Init Failed:', err);
            return res.status(500).json({ error: 'Database initialization failed' });
        }
    }

    // Pass request to Express app
    return app(req, res);
}
