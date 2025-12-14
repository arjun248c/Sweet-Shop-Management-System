export interface User {
    id?: number;
    username: string;
    password_hash: string;
    role: 'admin' | 'customer';
}

import { getDb } from '../database';

export const UserModel = {
    async create(user: User): Promise<number> {
        const pool = getDb();
        const result = await pool.query(
            'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
            [user.username, user.password_hash, user.role]
        );
        return result.rows[0].id;
    },

    async findByUsername(username: string): Promise<User | undefined> {
        const pool = getDb();
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        return result.rows[0];
    }
};
