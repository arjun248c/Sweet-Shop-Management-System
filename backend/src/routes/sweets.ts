import { Router } from 'express';
import { SweetModel } from '../models/Sweet';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// Retrieve all sweets (Protected)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const sweets = await SweetModel.findAll();
        res.json(sweets);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Search sweets (Protected)
router.get('/search', authenticateToken, async (req, res) => {
    try {
        const query = req.query.q as string;
        if (!query) {
            return res.status(400).json({ error: 'Search query required' });
        }
        const sweets = await SweetModel.search(query);
        res.json(sweets);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add a new sweet (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { name, category, price, quantity } = req.body;
        if (!name || !category || price === undefined || quantity === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const id = await SweetModel.create({ name, category, price, quantity });
        res.status(201).json({ id, name, category, price, quantity });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update a sweet (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await SweetModel.update(id, req.body);
        const updated = await SweetModel.findById(id);
        if (!updated) {
            return res.status(404).json({ error: 'Sweet not found' });
        }
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a sweet (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await SweetModel.delete(id);
        res.json({ message: 'Sweet deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
