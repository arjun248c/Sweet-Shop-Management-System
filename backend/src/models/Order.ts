import { getSQLiteDB } from '../database-sqlite';
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
        const db = getSQLiteDB();

        // Prepare transaction
        const createOrderTransaction = db.transaction((userId: number, items: OrderItem[]) => {
            let totalAmount = 0;
            const finalItems: OrderItem[] = [];

            // 1. Validate Items & Calculate Total
            // Note: Since better-sqlite3 is synchronous, we can't easily await inside transaction function if it's strictly sync.
            // But we can do the validation checks *before* the transaction or reading directly from DB synchronously.

            // Re-fetching sweets synchronously to ensure prices/stock are correct inside transaction
            const getSweetStmt = db.prepare('SELECT * FROM sweets WHERE id = ?');

            for (const item of items) {
                const sweet: any = getSweetStmt.get(item.sweetId);
                if (!sweet) throw new Error(`Sweet with ID ${item.sweetId} not found`);
                if (sweet.stock < item.quantity) throw new Error(`Insufficient stock for ${sweet.name}`);

                totalAmount += sweet.price * item.quantity;
                finalItems.push({
                    ...item,
                    priceAtPurchase: sweet.price
                });
            }

            // 2. Create Order
            const insertOrderStmt = db.prepare('INSERT INTO orders (user_id, total_amount) VALUES (?, ?)');
            const orderResult = insertOrderStmt.run(userId, totalAmount);
            const orderId = orderResult.lastInsertRowid as number;

            // 3. Create Order Items & Update Stock
            const insertOrderItemStmt = db.prepare('INSERT INTO order_items (order_id, sweet_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)');
            const updateStockStmt = db.prepare('UPDATE sweets SET stock = stock - ? WHERE id = ?');

            for (const item of finalItems) {
                insertOrderItemStmt.run(orderId, item.sweetId, item.quantity, item.priceAtPurchase);
                updateStockStmt.run(item.quantity, item.sweetId);
            }

            return orderId;
        });

        // Execute transaction
        return createOrderTransaction(userId, items);
    },

    async findByUserId(userId: number): Promise<any[]> {
        const db = getSQLiteDB();

        // Get Orders
        const ordersStmt = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC');
        const orders = ordersStmt.all(userId) as any[];

        const enrichedOrders = [];
        const itemsStmt = db.prepare(`
            SELECT oi.*, s.name as sweet_name 
            FROM order_items oi 
            JOIN sweets s ON oi.sweet_id = s.id 
            WHERE oi.order_id = ?
        `);

        for (const order of orders) {
            const items = itemsStmt.all(order.id);
            enrichedOrders.push({ ...order, items });
        }
        return enrichedOrders;
    },

    async findAll(): Promise<any[]> {
        const db = getSQLiteDB();

        // Get all orders with username
        const ordersStmt = db.prepare(`
            SELECT o.*, u.username 
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            ORDER BY o.created_at DESC
        `);
        const orders = ordersStmt.all() as any[];

        const enrichedOrders = [];
        const itemsStmt = db.prepare(`
            SELECT oi.*, s.name as sweet_name 
            FROM order_items oi 
            JOIN sweets s ON oi.sweet_id = s.id 
            WHERE oi.order_id = ?
        `);

        for (const order of orders) {
            const items = itemsStmt.all(order.id);
            enrichedOrders.push({ ...order, items });
        }
        return enrichedOrders;
    }
};
