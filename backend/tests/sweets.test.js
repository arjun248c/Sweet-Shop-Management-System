"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
const database_1 = require("../src/database");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const request = (0, supertest_1.default)(app_1.default);
const SECRET_KEY = process.env.JWT_SECRET || 'secret';
(0, node_test_1.describe)('Sweets API', () => {
    let adminToken;
    let customerToken;
    (0, node_test_1.before)(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, database_1.initializeDatabase)();
        const db = (0, database_1.getDb)();
        yield db.exec('DELETE FROM sweets');
        yield db.exec('DELETE FROM users');
        adminToken = jsonwebtoken_1.default.sign({ userId: 1, username: 'admin', role: 'admin' }, SECRET_KEY);
        customerToken = jsonwebtoken_1.default.sign({ userId: 2, username: 'customer', role: 'customer' }, SECRET_KEY);
    }));
    (0, node_test_1.after)(() => __awaiter(void 0, void 0, void 0, function* () {
        // Cleanup if needed
    }));
    (0, node_test_1.it)('should allow admin to add a sweet', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.post('/api/sweets')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            name: 'Chocolate Bar',
            category: 'Chocolate',
            price: 2.50,
            quantity: 100
        });
        node_assert_1.default.strictEqual(response.status, 201);
        node_assert_1.default.strictEqual(response.body.name, 'Chocolate Bar');
    }));
    (0, node_test_1.it)('should NOT allow customer to add a sweet', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.post('/api/sweets')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({
            name: 'Lollipop',
            category: 'Hard Candy',
            price: 0.50,
            quantity: 200
        });
        node_assert_1.default.strictEqual(response.status, 403);
    }));
    (0, node_test_1.it)('should list all sweets for authenticated users', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.get('/api/sweets')
            .set('Authorization', `Bearer ${customerToken}`);
        node_assert_1.default.strictEqual(response.status, 200);
        node_assert_1.default.ok(Array.isArray(response.body));
        node_assert_1.default.strictEqual(response.body.length, 1);
    }));
    (0, node_test_1.it)('should update a sweet (Admin only)', () => __awaiter(void 0, void 0, void 0, function* () {
        const list = yield request.get('/api/sweets').set('Authorization', `Bearer ${adminToken}`);
        const sweetId = list.body[0].id;
        const response = yield request.put(`/api/sweets/${sweetId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ price: 3.00 });
        node_assert_1.default.strictEqual(response.status, 200);
        node_assert_1.default.strictEqual(response.body.price, 3.00);
    }));
    (0, node_test_1.it)('should delete a sweet (Admin only)', () => __awaiter(void 0, void 0, void 0, function* () {
        const addRes = yield request.post('/api/sweets')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            name: 'To Delete',
            category: 'DeleteMe',
            price: 1.00,
            quantity: 10
        });
        const sweetId = addRes.body.id;
        const response = yield request.delete(`/api/sweets/${sweetId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        node_assert_1.default.strictEqual(response.status, 200);
        const check = yield request.get('/api/sweets').set('Authorization', `Bearer ${adminToken}`);
        const found = check.body.find((s) => s.id === sweetId);
        node_assert_1.default.strictEqual(found, undefined);
    }));
    (0, node_test_1.it)('should allow customer to purchase a sweet', () => __awaiter(void 0, void 0, void 0, function* () {
        const addRes = yield request.post('/api/sweets')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Buy Me', category: 'Test', price: 1.00, quantity: 10 });
        const sweetId = addRes.body.id;
        const response = yield request.post(`/api/sweets/${sweetId}/purchase`)
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ quantity: 2 });
        node_assert_1.default.strictEqual(response.status, 200);
        node_assert_1.default.strictEqual(response.body.message, 'Purchase successful');
        const check = yield request.get('/api/sweets').set('Authorization', `Bearer ${adminToken}`);
        const sweet = check.body.find((s) => s.id === sweetId);
        node_assert_1.default.strictEqual(sweet.quantity, 8);
    }));
    (0, node_test_1.it)('should NOT allow purchase if insufficient stock', () => __awaiter(void 0, void 0, void 0, function* () {
        const addRes = yield request.post('/api/sweets')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Limited', category: 'Test', price: 1.00, quantity: 1 });
        const sweetId = addRes.body.id;
        const response = yield request.post(`/api/sweets/${sweetId}/purchase`)
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ quantity: 2 });
        node_assert_1.default.strictEqual(response.status, 400);
        node_assert_1.default.strictEqual(response.body.error, 'Insufficient stock');
    }));
    (0, node_test_1.it)('should allow admin to restock a sweet', () => __awaiter(void 0, void 0, void 0, function* () {
        const addRes = yield request.post('/api/sweets')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Restock Me', category: 'Test', price: 1.00, quantity: 5 });
        const sweetId = addRes.body.id;
        const response = yield request.post(`/api/sweets/${sweetId}/restock`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ quantity: 5 });
        node_assert_1.default.strictEqual(response.status, 200);
        const check = yield request.get('/api/sweets').set('Authorization', `Bearer ${adminToken}`);
        const sweet = check.body.find((s) => s.id === sweetId);
        node_assert_1.default.strictEqual(sweet.quantity, 10);
    }));
    (0, node_test_1.it)('should NOT allow customer to restock', () => __awaiter(void 0, void 0, void 0, function* () {
        const addRes = yield request.post('/api/sweets')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'No Touch', category: 'Test', price: 1.00, quantity: 5 });
        const sweetId = addRes.body.id;
        const response = yield request.post(`/api/sweets/${sweetId}/restock`)
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ quantity: 5 });
        node_assert_1.default.strictEqual(response.status, 403);
    }));
});
