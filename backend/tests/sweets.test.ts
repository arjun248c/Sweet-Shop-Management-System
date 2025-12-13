import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';
import app from '../src/app';
import { initializeDatabase, getDb } from '../src/database';
import jwt from 'jsonwebtoken';

const request = supertest(app);
const SECRET_KEY = process.env.JWT_SECRET || 'secret';

describe('Sweets API', () => {
    let adminToken: string;
    let customerToken: string;

    before(async () => {
        await initializeDatabase();
        const db = getDb();
        await db.exec('DELETE FROM sweets');
        await db.exec('DELETE FROM users');

        adminToken = jwt.sign({ userId: 1, username: 'admin', role: 'admin' }, SECRET_KEY);
        customerToken = jwt.sign({ userId: 2, username: 'customer', role: 'customer' }, SECRET_KEY);
    });

    after(async () => {
        // Cleanup if needed
    });

    it('should allow admin to add a sweet', async () => {
        const response = await request.post('/api/sweets')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Chocolate Bar',
                category: 'Chocolate',
                price: 2.50,
                quantity: 100
            });

        assert.strictEqual(response.status, 201);
        assert.strictEqual(response.body.name, 'Chocolate Bar');
    });

    it('should NOT allow customer to add a sweet', async () => {
        const response = await request.post('/api/sweets')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({
                name: 'Lollipop',
                category: 'Hard Candy',
                price: 0.50,
                quantity: 200
            });

        assert.strictEqual(response.status, 403);
    });

    it('should list all sweets for authenticated users', async () => {
        const response = await request.get('/api/sweets')
            .set('Authorization', `Bearer ${customerToken}`);

        assert.strictEqual(response.status, 200);
        assert.ok(Array.isArray(response.body));
        assert.strictEqual(response.body.length, 1);
    });

    it('should update a sweet (Admin only)', async () => {
        const list = await request.get('/api/sweets').set('Authorization', `Bearer ${adminToken}`);
        const sweetId = list.body[0].id;

        const response = await request.put(`/api/sweets/${sweetId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ price: 3.00 });

        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.body.price, 3.00);
    });

    it('should delete a sweet (Admin only)', async () => {
        const addRes = await request.post('/api/sweets')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'To Delete',
                category: 'DeleteMe',
                price: 1.00,
                quantity: 10
            });
        const sweetId = addRes.body.id;

        const response = await request.delete(`/api/sweets/${sweetId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        assert.strictEqual(response.status, 200);

        const check = await request.get('/api/sweets').set('Authorization', `Bearer ${adminToken}`);
        const found = check.body.find((s: any) => s.id === sweetId);
        assert.strictEqual(found, undefined);
    });

    it('should allow customer to purchase a sweet', async () => {
        const addRes = await request.post('/api/sweets')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Buy Me', category: 'Test', price: 1.00, quantity: 10 });
        const sweetId = addRes.body.id;

        const response = await request.post(`/api/sweets/${sweetId}/purchase`)
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ quantity: 2 });

        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.body.message, 'Purchase successful');

        const check = await request.get('/api/sweets').set('Authorization', `Bearer ${adminToken}`);
        const sweet = check.body.find((s: any) => s.id === sweetId);
        assert.strictEqual(sweet.quantity, 8);
    });

    it('should NOT allow purchase if insufficient stock', async () => {
        const addRes = await request.post('/api/sweets')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Limited', category: 'Test', price: 1.00, quantity: 1 });
        const sweetId = addRes.body.id;

        const response = await request.post(`/api/sweets/${sweetId}/purchase`)
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ quantity: 2 });

        assert.strictEqual(response.status, 400);
        assert.strictEqual(response.body.error, 'Insufficient stock');
    });

    it('should allow admin to restock a sweet', async () => {
        const addRes = await request.post('/api/sweets')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Restock Me', category: 'Test', price: 1.00, quantity: 5 });
        const sweetId = addRes.body.id;

        const response = await request.post(`/api/sweets/${sweetId}/restock`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ quantity: 5 });

        assert.strictEqual(response.status, 200);

        const check = await request.get('/api/sweets').set('Authorization', `Bearer ${adminToken}`);
        const sweet = check.body.find((s: any) => s.id === sweetId);
        assert.strictEqual(sweet.quantity, 10);
    });

    it('should NOT allow customer to restock', async () => {
        const addRes = await request.post('/api/sweets')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'No Touch', category: 'Test', price: 1.00, quantity: 5 });
        const sweetId = addRes.body.id;

        const response = await request.post(`/api/sweets/${sweetId}/restock`)
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ quantity: 5 });

        assert.strictEqual(response.status, 403);
    });
});
