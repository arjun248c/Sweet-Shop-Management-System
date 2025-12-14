import { getSQLiteDB } from './database-sqlite';

const db = getSQLiteDB();

console.log('--- Users ---');
const users = db.prepare('SELECT * FROM users').all();
console.log(JSON.stringify(users, null, 2));

console.log('\n--- Sweets ---');
const sweets = db.prepare('SELECT * FROM sweets').all();
console.log(JSON.stringify(sweets, null, 2));

console.log('\n--- Orders ---');
const orders = db.prepare('SELECT * FROM orders').all();
console.log(JSON.stringify(orders, null, 2));
