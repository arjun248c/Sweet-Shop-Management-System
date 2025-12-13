export interface Sweet {
    id?: number;
    name: string;
    category: string;
    price: number;
    quantity: number;
}

import { getDb } from '../database';

export const SweetModel = {
    async create(sweet: Sweet): Promise<number> {
        const db = getDb();
        const result = await db.run(
            'INSERT INTO sweets (name, category, price, quantity) VALUES (?, ?, ?, ?)',
            [sweet.name, sweet.category, sweet.price, sweet.quantity]
        );
        return result.lastID!;
    },

    async findAll(): Promise<Sweet[]> {
        const db = getDb();
        return db.all<Sweet[]>('SELECT * FROM sweets');
    },

    async findById(id: number): Promise<Sweet | undefined> {
        const db = getDb();
        return db.get<Sweet>('SELECT * FROM sweets WHERE id = ?', [id]);
    },

    async update(id: number, sweet: Partial<Sweet>): Promise<void> {
        const db = getDb();
        const fields = Object.keys(sweet).map(key => `${key} = ?`).join(', ');
        const values = Object.values(sweet);
        await db.run(`UPDATE sweets SET ${fields} WHERE id = ?`, [...values, id]);
    },

    async delete(id: number): Promise<void> {
        const db = getDb();
        await db.run('DELETE FROM sweets WHERE id = ?', [id]);
    },

    async search(query: string): Promise<Sweet[]> {
        const db = getDb();
        const searchPattern = `%${query}%`;
        return db.all<Sweet[]>(
            'SELECT * FROM sweets WHERE name LIKE ? OR category LIKE ?',
            [searchPattern, searchPattern]
        );
    },

    async updateQuantity(id: number, delta: number): Promise<void> {
        const db = getDb();
        // Verify current stock first if decreasing (application-level check for better error control)
        if (delta < 0) {
            const sweet = await this.findById(id);
            if (!sweet) throw new Error('Sweet not found');
            if (sweet.quantity + delta < 0) {
                throw new Error('Insufficient stock');
            }
        }

        await db.run('UPDATE sweets SET quantity = quantity + ? WHERE id = ?', [delta, id]);
    }
};
