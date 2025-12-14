import { initializeSQLiteDatabase, getSQLiteDB } from './database-sqlite';

initializeSQLiteDatabase();
const db = getSQLiteDB();

const sampleSweets = [
    { name: 'Chocolate Truffle', description: 'Rich dark chocolate', price: 2.99, image_url: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400', stock: 50 },
    { name: 'Strawberry Delight', description: 'Fresh strawberry', price: 1.99, image_url: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400', stock: 75 },
    { name: 'Lemon Drop', description: 'Tangy lemon', price: 0.99, image_url: 'https://images.unsplash.com/photo-1514517521153-1be72277b32f?w=400', stock: 100 }
];

const stmt = db.prepare('INSERT INTO sweets (name, description, price, image_url, stock) VALUES (?, ?, ?, ?, ?)');

for (const sweet of sampleSweets) {
    stmt.run(sweet.name, sweet.description, sweet.price, sweet.image_url, sweet.stock);
}

console.log('✅ Added sample sweets!');
