import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';

const router = Router();
const SECRET_KEY = process.env.JWT_SECRET || 'secret';

router.post('/register', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        if (!username || !password) {
            // @ts-ignore
            return res.status(400).json({ error: 'Username and password required' });
        }

        const existingUser = await UserModel.findByUsername(username);
        if (existingUser) {
            // @ts-ignore
            return res.status(400).json({ error: 'Username already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const userId = await UserModel.create({
            username,
            password_hash: passwordHash,
            role: role || 'customer'
        });

        res.status(201).json({ message: 'User registered successfully', userId });
    } catch (error) {
        // @ts-ignore
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await UserModel.findByUsername(username);

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            // @ts-ignore
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (error) {
        // @ts-ignore
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
