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
        const pool = getDb();

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

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const orderResult = await client.query(
                'INSERT INTO orders (user_id, total_amount) VALUES ($1, $2) RETURNING id',
                [userId, totalAmount]
            );
            const orderId = orderResult.rows[0].id;

            for (const item of finalItems) {
                await client.query(
                    'INSERT INTO order_items (order_id, sweet_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)',
                    [orderId, item.sweetId, item.quantity, item.priceAtPurchase]
                );

                await client.query('UPDATE sweets SET quantity = quantity - $1 WHERE id = $2', [item.quantity, item.sweetId]);
            }

            await client.query('COMMIT');
            return orderId;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    async findByUserId(userId: number): Promise<any[]> {
        const pool = getDb();
        const ordersResult = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        const orders = ordersResult.rows;

        const enrichedOrders = [];
        for (const order of orders) {
            const itemsResult = await pool.query(`
        SELECT oi.*, s.name as sweet_name 
        FROM order_items oi 
        JOIN sweets s ON oi.sweet_id = s.id 
        WHERE oi.order_id = $1`,
                [order.id]
            );
            enrichedOrders.push({ ...order, items: itemsResult.rows });
        }
        return enrichedOrders;
    },

    async findAll(): Promise<any[]> {
        const pool = getDb();
        const ordersResult = await pool.query('SELECT o.*, u.username FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC');
        const orders = ordersResult.rows;

        const enrichedOrders = [];
        for (const order of orders) {
            const itemsResult = await pool.query(`
        SELECT oi.*, s.name as sweet_name 
        FROM order_items oi 
        JOIN sweets s ON oi.sweet_id = s.id 
        WHERE oi.order_id = $1`,
                [order.id]
            );
            enrichedOrders.push({ ...order, items: itemsResult.rows });
        }
        return enrichedOrders;
    }
};
