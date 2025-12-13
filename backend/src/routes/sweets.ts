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

// Purchase a sweet (Protected - Any user)
// @ts-ignore
router.post('/:id/purchase', authenticateToken, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { quantity } = req.body;

        if (!quantity || quantity <= 0) {
            // @ts-ignore
            return res.status(400).json({ error: 'Invalid quantity' });
        }

        try {
            // Decrease quantity (pass negative delta)
            await SweetModel.updateQuantity(id, -quantity);
            res.json({ message: 'Purchase successful' });
        } catch (err: any) {
            if (err.message === 'Insufficient stock') {
                // @ts-ignore
                return res.status(400).json({ error: 'Insufficient stock' });
            } else if (err.message === 'Sweet not found') {
                // @ts-ignore
                return res.status(404).json({ error: 'Sweet not found' });
            }
            throw err;
        }
    } catch (error) {
        // @ts-ignore
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Restock a sweet (Admin only)
// @ts-ignore
router.post('/:id/restock', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { quantity } = req.body;

        if (!quantity || quantity <= 0) {
            // @ts-ignore
            return res.status(400).json({ error: 'Invalid quantity' });
        }

        await SweetModel.updateQuantity(id, quantity);
        res.json({ message: 'Restock successful' });
    } catch (error) {
        // @ts-ignore
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
