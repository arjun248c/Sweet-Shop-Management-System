import { getDb } from '../database';
import { SweetModel } from './Sweet';

export interface OrderItem {
    sweetId: number;
    quantity: number;
    priceAtPurchase?: number;
}

export interface Order {
    id?: number;
    userId: number;
    items: OrderItem[];
    totalAmount: number;
    createdAt?: string;
}

export const OrderModel = {
    async createOrder(userId: number, items: OrderItem[]): Promise<number> {
        const db = getDb();

        // We need transaction support. sqlite3 in node supports serialization but raw queries are best wrapped manually or handled carefully.
        // 'sqlite' wrapper doesn't support explicit transaction object easily but we can just run commands.
        // However, for safety in concurrent app, we should ideally use proper transaction syntax.

        // Since we are checking stock, we need to be careful.
        // We will do this in a logic block. 

        // 1. Calculate total and verify stock for ALL items
        let totalAmount = 0;
        const finalItems: OrderItem[] = [];

        for (const item of items) {
            const sweet = await SweetModel.findById(item.sweetId);
            if (!sweet) throw new Error(`Sweet with ID ${item.sweetId} not found`);
            if (sweet.quantity < item.quantity) throw new Error(`Insufficient stock for ${sweet.name}`);

            totalAmount += sweet.price * item.quantity;
            finalItems.push({
                ...item,
                priceAtPurchase: sweet.price
            });
        }

        // 2. Execute Transaction
        try {
            await db.run('BEGIN TRANSACTION');

            // Create Order
            const orderResult = await db.run(
                'INSERT INTO orders (user_id, total_amount) VALUES (?, ?)',
                [userId, totalAmount]
            );
            const orderId = orderResult.lastID!;

            // Insert Items and Update Stock
            for (const item of finalItems) {
                await db.run(
                    'INSERT INTO order_items (order_id, sweet_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
                    [orderId, item.sweetId, item.quantity, item.priceAtPurchase]
                );

                // Update Stock (using our atomic update method logic, but direct sql here for transaction context if needed, 
                // strictly speaking SweetModel.updateQuantity is atomic per call but here we are in transaction so standard update is fine)
                await db.run('UPDATE sweets SET quantity = quantity - ? WHERE id = ?', [item.quantity, item.sweetId]);
            }

            await db.run('COMMIT');
            return orderId;
        } catch (error) {
            await db.run('ROLLBACK');
            throw error;
        }
    },

    async findByUserId(userId: number): Promise<any[]> {
        const db = getDb();
        const orders = await db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);

        // Enrich with items
        const enrichedOrders = [];
        for (const order of orders) {
            const items = await db.all(`
        SELECT oi.*, s.name as sweet_name 
        FROM order_items oi 
        JOIN sweets s ON oi.sweet_id = s.id 
        WHERE oi.order_id = ?`,
                [order.id]
            );
            enrichedOrders.push({ ...order, items });
        }
        return enrichedOrders;
    },

    async findAll(): Promise<any[]> {
        const db = getDb();
        const orders = await db.all('SELECT o.*, u.username FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC');

        const enrichedOrders = [];
        for (const order of orders) {
            const items = await db.all(`
        SELECT oi.*, s.name as sweet_name 
        FROM order_items oi 
        JOIN sweets s ON oi.sweet_id = s.id 
        WHERE oi.order_id = ?`,
                [order.id]
            );
            enrichedOrders.push({ ...order, items });
        }
        return enrichedOrders;
    }
};
