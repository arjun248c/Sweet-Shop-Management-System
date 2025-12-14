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
const request = (0, supertest_1.default)(app_1.default);
let authToken;
let adminToken;
let sweetId;
let userId;
(0, node_test_1.test)('Order Management API', (t) => __awaiter(void 0, void 0, void 0, function* () {
    // Setup: Login and Create a Sweet
    yield t.test('setup', () => __awaiter(void 0, void 0, void 0, function* () {
        // Register & Login User
        yield request.post('/api/auth/register').send({ username: 'orderuser', password: 'password123' });
        const loginRes = yield request.post('/api/auth/login').send({ username: 'orderuser', password: 'password123' });
        authToken = loginRes.body.token;
        // Register & Login Admin
        yield request.post('/api/auth/register').send({ username: 'orderadmin', password: 'password123', role: 'admin' });
        const adminLoginRes = yield request.post('/api/auth/login').send({ username: 'orderadmin', password: 'password123' });
        adminToken = adminLoginRes.body.token;
        // Create Sweet
        const sweetRes = yield request.post('/api/sweets')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Order Sweet', category: 'Test', price: 10, quantity: 20 });
        sweetId = sweetRes.body.id;
    }));
    yield t.test('should create an order and deduct stock', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.post('/api/orders')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            items: [
                { sweetId: sweetId, quantity: 5 }
            ]
        });
        node_assert_1.default.strictEqual(response.status, 201);
        node_assert_1.default.ok(response.body.orderId);
        // Verify Stock
        const db = (0, database_1.getDb)();
        const sweet = yield db.get('SELECT * FROM sweets WHERE id = ?', [sweetId]);
        node_assert_1.default.strictEqual(sweet.quantity, 15); // 20 - 5
    }));
    yield t.test('should NOT create order if insufficient stock', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.post('/api/orders')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            items: [
                { sweetId: sweetId, quantity: 100 } // Only 15 left
            ]
        });
        node_assert_1.default.strictEqual(response.status, 400);
        // Stock should remain same
        const db = (0, database_1.getDb)();
        const sweet = yield db.get('SELECT * FROM sweets WHERE id = ?', [sweetId]);
        node_assert_1.default.strictEqual(sweet.quantity, 15);
    }));
    yield t.test('should get orders for user', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.get('/api/orders')
            .set('Authorization', `Bearer ${authToken}`);
        node_assert_1.default.strictEqual(response.status, 200);
        node_assert_1.default.ok(Array.isArray(response.body));
        node_assert_1.default.strictEqual(response.body.length, 1);
        node_assert_1.default.strictEqual(response.body[0].items[0].sweet_id, sweetId);
    }));
    yield t.test('should get all orders for admin', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.get('/api/orders')
            .set('Authorization', `Bearer ${adminToken}`);
        node_assert_1.default.strictEqual(response.status, 200);
        node_assert_1.default.ok(Array.isArray(response.body));
        node_assert_1.default.ok(response.body.length >= 1);
    }));
}));
