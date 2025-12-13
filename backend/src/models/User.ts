export interface User {
    id?: number;
    username: string;
    password_hash: string;
    role: 'admin' | 'customer';
}

import { getDb } from '../database';

export const UserModel = {
    async create(user: User): Promise<number> {
        const db = getDb();
        const result = await db.run(
            'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
            [user.username, user.password_hash, user.role]
        );
        return result.lastID!;
    },

    async findByUsername(username: string): Promise<User | undefined> {
        const db = getDb();
        return db.get<User>('SELECT * FROM users WHERE username = ?', [username]);
    }
};
