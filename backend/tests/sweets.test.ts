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
        await db.exec('DELETE FROM users'); // Clean users too just in case

        // Create tokens for testing (mocking user existence not strictly needed if we trust middleware, 
        // but good to be aligned)
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
        // First get the sweet to find its ID
        const list = await request.get('/api/sweets').set('Authorization', `Bearer ${adminToken}`);
        const sweetId = list.body[0].id;

        const response = await request.put(`/api/sweets/${sweetId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ price: 3.00 });

        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.body.price, 3.00);
    });

    it('should delete a sweet (Admin only)', async () => {
        // First add another sweet to delete
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

        // Verify it's gone
        const check = await request.get('/api/sweets').set('Authorization', `Bearer ${adminToken}`);
        const found = check.body.find((s: any) => s.id === sweetId);
        assert.strictEqual(found, undefined);
    });
});
