export interface Sweet {
    id?: number;
    name: string;
    category: string;  // mapped from description for frontend compatibility
    description?: string;
    price: number;
    quantity: number;  // mapped from stock for frontend compatibility
    stock?: number;
    image_url?: string;
}

import { getSQLiteDB } from '../database-sqlite';

export const SweetModel = {
    // Helper to map DB row to Sweet interface
    _mapRow(row: any): Sweet {
        return {
            ...row,
            category: row.description || 'General',       // Map description to category
            quantity: row.stock || 0,                     // Map stock to quantity
            description: row.description,
            stock: row.stock,
            image_url: row.image_url
        };
    },

    async findAll(): Promise<Sweet[]> {
        const db = getSQLiteDB();
        const stmt = db.prepare('SELECT * FROM sweets');
        const rows = stmt.all();
        return rows.map(this._mapRow);
    },

    async getById(id: number): Promise<Sweet | undefined> {
        return this.findById(id);
    },

    async findById(id: number): Promise<Sweet | undefined> {
        const db = getSQLiteDB();
        const stmt = db.prepare('SELECT * FROM sweets WHERE id = ?');
        const row = stmt.get(id);
        return row ? this._mapRow(row) : undefined;
    },

    async search(query: string): Promise<Sweet[]> {
        const db = getSQLiteDB();
        const stmt = db.prepare('SELECT * FROM sweets WHERE name LIKE ? OR description LIKE ?');
        const searchPattern = `%${query}%`;
        const rows = stmt.all(searchPattern, searchPattern);
        return rows.map(this._mapRow);
    },

    async create(sweet: Sweet): Promise<number> {
        const db = getSQLiteDB();
        const stmt = db.prepare(
            'INSERT INTO sweets (name, description, price, image_url, stock) VALUES (?, ?, ?, ?, ?)'
        );

        // Use category as description if description is missing
        const description = sweet.description || sweet.category;
        // Use quantity as stock if stock is missing
        const stock = sweet.stock !== undefined ? sweet.stock : sweet.quantity;

        const result = stmt.run(
            sweet.name,
            description || '',
            sweet.price,
            sweet.image_url || null,
            stock || 0
        );
        return result.lastInsertRowid as number;
    },

    async update(id: number, sweet: Partial<Sweet>): Promise<void> {
        const db = getSQLiteDB();
        const fields: string[] = [];
        const values: any[] = [];

        if (sweet.name !== undefined) {
            fields.push('name = ?');
            values.push(sweet.name);
        }
        if (sweet.description !== undefined || sweet.category !== undefined) {
            fields.push('description = ?');
            values.push(sweet.description || sweet.category);
        }
        if (sweet.price !== undefined) {
            fields.push('price = ?');
            values.push(sweet.price);
        }
        if (sweet.image_url !== undefined) {
            fields.push('image_url = ?');
            values.push(sweet.image_url);
        }
        if (sweet.stock !== undefined || sweet.quantity !== undefined) {
            fields.push('stock = ?');
            values.push(sweet.stock !== undefined ? sweet.stock : sweet.quantity);
        }

        if (fields.length > 0) {
            values.push(id);
            const stmt = db.prepare(`UPDATE sweets SET ${fields.join(', ')} WHERE id = ?`);
            stmt.run(...values);
        }
    },

    async delete(id: number): Promise<void> {
        const db = getSQLiteDB();
        const stmt = db.prepare('DELETE FROM sweets WHERE id = ?');
        stmt.run(id);
    },

    async updateQuantity(id: number, delta: number): Promise<void> {
        const db = getSQLiteDB();

        // Transaction to ensure stock doesn't go negative
        const transaction = db.transaction((id: number, delta: number) => {
            const sweet = this.findById(id) as any; // synchronous call if implemented, but we need raw query here

            const getStmt = db.prepare('SELECT stock FROM sweets WHERE id = ?');
            const row: any = getStmt.get(id);

            if (!row) throw new Error('Sweet not found');

            if (delta < 0 && (row.stock + delta < 0)) {
                throw new Error('Insufficient stock');
            }

            const updateStmt = db.prepare('UPDATE sweets SET stock = stock + ? WHERE id = ?');
            updateStmt.run(delta, id);
        });

        transaction(id, delta);
    }
};
