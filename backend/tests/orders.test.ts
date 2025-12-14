import { test } from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';
import app from '../src/app';
import { getDb } from '../src/database';

const request = supertest(app);
let authToken: string;
let adminToken: string;
let sweetId: number;
let userId: number;

test('Order Management API', async (t) => {
    // Setup: Login and Create a Sweet
    await t.test('setup', async () => {
        // Register & Login User
        await request.post('/api/auth/register').send({ username: 'orderuser', password: 'password123' });
        const loginRes = await request.post('/api/auth/login').send({ username: 'orderuser', password: 'password123' });
        authToken = loginRes.body.token;

        // Register & Login Admin
        await request.post('/api/auth/register').send({ username: 'orderadmin', password: 'password123', role: 'admin' });
        const adminLoginRes = await request.post('/api/auth/login').send({ username: 'orderadmin', password: 'password123' });
        adminToken = adminLoginRes.body.token;

        // Create Sweet
        const sweetRes = await request.post('/api/sweets')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Order Sweet', category: 'Test', price: 10, quantity: 20 });
        sweetId = sweetRes.body.id;
    });

    await t.test('should create an order and deduct stock', async () => {
        const response = await request.post('/api/orders')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                items: [
                    { sweetId: sweetId, quantity: 5 }
                ]
            });

        assert.strictEqual(response.status, 201);
        assert.ok(response.body.orderId);

        // Verify Stock
        const db = getDb();
        const sweet = await db.get('SELECT * FROM sweets WHERE id = ?', [sweetId]);
        assert.strictEqual(sweet.quantity, 15); // 20 - 5
    });

    await t.test('should NOT create order if insufficient stock', async () => {
        const response = await request.post('/api/orders')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                items: [
                    { sweetId: sweetId, quantity: 100 } // Only 15 left
                ]
            });

        assert.strictEqual(response.status, 400);

        // Stock should remain same
        const db = getDb();
        const sweet = await db.get('SELECT * FROM sweets WHERE id = ?', [sweetId]);
        assert.strictEqual(sweet.quantity, 15);
    });

    await t.test('should get orders for user', async () => {
        const response = await request.get('/api/orders')
            .set('Authorization', `Bearer ${authToken}`);

        assert.strictEqual(response.status, 200);
        assert.ok(Array.isArray(response.body));
        assert.strictEqual(response.body.length, 1);
        assert.strictEqual(response.body[0].items[0].sweet_id, sweetId);
    });

    await t.test('should get all orders for admin', async () => {
        const response = await request.get('/api/orders')
            .set('Authorization', `Bearer ${adminToken}`);

        assert.strictEqual(response.status, 200);
        assert.ok(Array.isArray(response.body));
        assert.ok(response.body.length >= 1);
    });
});
