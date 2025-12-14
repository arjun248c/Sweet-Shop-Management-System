import { Pool } from 'pg';

let pool: Pool;

export const initializeDatabase = async () => {
  if (pool) return; // Idempotency for serverless cold starts
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  const client = await pool.connect();
  try {
    await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT CHECK(role IN ('admin', 'customer')) NOT NULL DEFAULT 'customer'
            );

            CREATE TABLE IF NOT EXISTS sweets (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                price REAL NOT NULL,
                quantity INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                total_amount REAL NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS order_items (
                id SERIAL PRIMARY KEY,
                order_id INTEGER NOT NULL REFERENCES orders(id),
                sweet_id INTEGER NOT NULL REFERENCES sweets(id),
                quantity INTEGER NOT NULL,
                price_at_purchase REAL NOT NULL
            );
        `);
    console.log('Database initialized (Postgres)');
  } finally {
    client.release();
  }
};

export const getDb = () => {
  if (!pool) {
    throw new Error('Database not initialized');
  }
  return pool;
};

