import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';
import app from '../src/app';
import { initializeDatabase, getDb } from '../src/database';

const request = supertest(app);

describe('Authentication API', () => {
    before(async () => {
        // Initialize DB for testing
        // In a real scenario, use an in-memory DB or a separate test file
        // For this kata, we'll use the file but maybe reset it
        await initializeDatabase();
        // Clear users table
        const db = getDb();
        await db.exec('DELETE FROM users');
    });

    it('should register a new user', async () => {
        const response = await request.post('/api/auth/register').send({
            username: 'testuser',
            password: 'password123',
            role: 'customer'
        });

        assert.strictEqual(response.status, 201);
        assert.strictEqual(response.body.message, 'User registered successfully');
        assert.ok(response.body.userId);
    });

    it('should not register a user with existing username', async () => {
        const response = await request.post('/api/auth/register').send({
            username: 'testuser',
            password: 'password123',
            role: 'customer'
        });

        assert.strictEqual(response.status, 400);
    });

    it('should login with valid credentials', async () => {
        const response = await request.post('/api/auth/login').send({
            username: 'testuser',
            password: 'password123'
        });

        assert.strictEqual(response.status, 200);
        assert.ok(response.body.token);
    });

    it('should not login with invalid credentials', async () => {
        const response = await request.post('/api/auth/login').send({
            username: 'testuser',
            password: 'wrongpassword'
        });

        assert.strictEqual(response.status, 401);
    });
});
