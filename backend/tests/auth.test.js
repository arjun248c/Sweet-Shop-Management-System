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
(0, node_test_1.describe)('Authentication API', () => {
    (0, node_test_1.before)(() => __awaiter(void 0, void 0, void 0, function* () {
        // Initialize DB for testing
        // In a real scenario, use an in-memory DB or a separate test file
        // For this kata, we'll use the file but maybe reset it
        yield (0, database_1.initializeDatabase)();
        // Clear users table
        const db = (0, database_1.getDb)();
        yield db.exec('DELETE FROM users');
    }));
    (0, node_test_1.it)('should register a new user', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.post('/api/auth/register').send({
            username: 'testuser',
            password: 'password123',
            role: 'customer'
        });
        node_assert_1.default.strictEqual(response.status, 201);
        node_assert_1.default.strictEqual(response.body.message, 'User registered successfully');
        node_assert_1.default.ok(response.body.userId);
    }));
    (0, node_test_1.it)('should not register a user with existing username', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.post('/api/auth/register').send({
            username: 'testuser',
            password: 'password123',
            role: 'customer'
        });
        node_assert_1.default.strictEqual(response.status, 400);
    }));
    (0, node_test_1.it)('should login with valid credentials', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.post('/api/auth/login').send({
            username: 'testuser',
            password: 'password123'
        });
        node_assert_1.default.strictEqual(response.status, 200);
        node_assert_1.default.ok(response.body.token);
    }));
    (0, node_test_1.it)('should not login with invalid credentials', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.post('/api/auth/login').send({
            username: 'testuser',
            password: 'wrongpassword'
        });
        node_assert_1.default.strictEqual(response.status, 401);
    }));
});
