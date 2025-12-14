import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { OrderModel } from '../models/Order';

const router = Router();

// Create Order (Protected)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { items } = req.body;
        // @ts-ignore
        const userId = req.user.userId;

        if (!items || !Array.isArray(items) || items.length === 0) {
            // @ts-ignore
            return res.status(400).json({ error: 'Items array is required & cannot be empty' });
        }

        const orderId = await OrderModel.createOrder(userId, items);
        res.status(201).json({ message: 'Order created successfully', orderId });
    } catch (error: any) {
        console.error('Checkout Error:', error);

        if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
            // @ts-ignore
            return res.status(401).json({ error: 'User account not found. Please log out and register again.' });
        }

        // @ts-ignore
        res.status(400).json({ error: error.message || 'Failed to create order' });
    }
});

// Get Orders (Protected)
router.get('/', authenticateToken, async (req, res) => {
    try {
        // @ts-ignore
        const user = req.user;
        let orders;

        if (user.role === 'admin') {
            orders = await OrderModel.findAll();
        } else {
            orders = await OrderModel.findByUserId(user.userId);
        }

        res.json(orders);
    } catch (error) {
        // @ts-ignore
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

export default router;
