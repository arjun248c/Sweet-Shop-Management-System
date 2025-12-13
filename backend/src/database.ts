import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let db: Database;

export const initializeDatabase = async () => {
    db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin', 'customer')) NOT NULL DEFAULT 'customer'
    );
  `);

    console.log('Database initialized');
};

export const getDb = () => {
    if (!db) {
        throw new Error('Database not initialized');
    }
    return db;
};
