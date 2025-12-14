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
        const pool = getDb();
        const result = await pool.query(
            'INSERT INTO sweets (name, category, price, quantity) VALUES ($1, $2, $3, $4) RETURNING id',
            [sweet.name, sweet.category, sweet.price, sweet.quantity]
        );
        return result.rows[0].id;
    },

    async findAll(): Promise<Sweet[]> {
        const pool = getDb();
        const result = await pool.query('SELECT * FROM sweets');
        return result.rows;
    },

    async findById(id: number): Promise<Sweet | undefined> {
        const pool = getDb();
        const result = await pool.query('SELECT * FROM sweets WHERE id = $1', [id]);
        return result.rows[0];
    },

    async update(id: number, sweet: Partial<Sweet>): Promise<void> {
        const pool = getDb();
        const keys = Object.keys(sweet);
        const values = Object.values(sweet);

        if (keys.length === 0) return;

        const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
        // id is the last parameter
        await pool.query(`UPDATE sweets SET ${setClause} WHERE id = $${keys.length + 1}`, [...values, id]);
    },

    async delete(id: number): Promise<void> {
        const pool = getDb();
        await pool.query('DELETE FROM sweets WHERE id = $1', [id]);
    },

    async search(query: string): Promise<Sweet[]> {
        const pool = getDb();
        const searchPattern = `%${query}%`;
        const result = await pool.query(
            'SELECT * FROM sweets WHERE name LIKE $1 OR category LIKE $2',
            [searchPattern, searchPattern]
        );
        return result.rows;
    },

    async updateQuantity(id: number, delta: number): Promise<void> {
        const pool = getDb();
        // Verify current stock first if decreasing (application-level check for better error control)
        if (delta < 0) {
            const sweet = await this.findById(id);
            if (!sweet) throw new Error('Sweet not found');
            if (sweet.quantity + delta < 0) {
                throw new Error('Insufficient stock');
            }
        }

        await pool.query('UPDATE sweets SET quantity = quantity + $1 WHERE id = $2', [delta, id]);
    }
};
