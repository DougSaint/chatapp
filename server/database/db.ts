import { Database, open } from 'sqlite';
import * as sqlite3 from 'sqlite3';

const DB_NAME = 'chat.db';

async function setupDatabase() {
    const db = await open({
      filename: DB_NAME,
      driver: sqlite3.Database,
    });
  
    await createTables(db);
  
    return db;
  }

async function createTables(db: Database) {
    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `);
  
    await db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);
  }
  
  export async function addMessage(username: string, content: string, timestamp: number): Promise<void> {
    const db = await dbPromise;
    await db.run(
      `INSERT INTO messages (user_id, content, timestamp)
      SELECT id, ?, ? FROM users WHERE username = ?`,
      [content, timestamp, username]
    );
  }

  export async function getMessageHistory(): Promise<any[]> {
    const db = await dbPromise;
    const rows = await db.all(
      `SELECT users.username, messages.content, messages.timestamp
      FROM messages
      JOIN users ON messages.user_id = users.id
      ORDER BY messages.timestamp`
    );
    return rows;
  }


export const dbPromise = setupDatabase();
