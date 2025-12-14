export interface User {
    id?: number;
    username: string;
    password_hash: string;
    role: 'admin' | 'customer';
}

import { getSQLiteDB } from '../database-sqlite';

export const UserModel = {
    async create(user: User): Promise<number> {
        const db = getSQLiteDB();
        const stmt = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)');
        const result = stmt.run(user.username, user.password_hash, user.role);
        return result.lastInsertRowid as number;
    },

    async findByUsername(username: string): Promise<User | undefined> {
        const db = getSQLiteDB();
        const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
        return stmt.get(username) as User | undefined;
    }
};
