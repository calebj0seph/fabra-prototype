import 'server-only';

import { AsyncDatabase } from 'promised-sqlite3';

// Open the database once at startup and keep it open for the lifetime of the process
const database: Promise<AsyncDatabase> = openDatabase();

/**
 * Creates all necessary tables and indexes in the SQLite database if they do not already exist.
 *
 * @param database The SQLite database connection.
 */
async function createTables(database: AsyncDatabase) {
  // Create the users table
  await database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      created       REAL NOT NULL DEFAULT (strftime('%s', 'now')),
      email         TEXT NOT NULL UNIQUE,
      display_name  TEXT NOT NULL,
      -- 64 byte binary field for scrypt-derived hash
      password_hash BLOB NOT NULL,
      -- 64 byte binary field for the salt
      password_salt BLOB NOT NULL
    );
  `);

  // Create the files table
  await database.run(`
    CREATE TABLE IF NOT EXISTS files (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      created   REAL NOT NULL DEFAULT (strftime('%s', 'now')),
      user_id   INTEGER NOT NULL,
      title     TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Create an index on user_id in the files table for faster lookup of files by user
  await database.run(`
    CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
  `);

  // Create the sessions table
  // We'd probably want to use signed JWTs to avoid needing to lookup sessions from the database,
  // but for a prototype this is fine
  await database.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id   INTEGER NOT NULL,
      -- 256-bit hex string stored as text
      token     TEXT NOT NULL UNIQUE,
      expiry    REAL NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Create an index on the expiry column for efficient cleanup of expired sessions (not implemented
  // in this prototype, but good to have)
  await database.run(`
    CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expiry);
  `);
}

/**
 * Opens the SQLite database file and initializes the schema if necessary.
 *
 * @remarks This is called once at startup and the database connection is kept open for the lifetime
 * of the process.
 */
async function openDatabase() {
  // Use a simple on-disk SQLite database, since this is just a prototype
  const database = await AsyncDatabase.open('./data.db');

  // Enable write-ahead logging, which is more efficient if we had a pool of multiple Node.js
  // processes accessing the database concurrently
  await database.exec(`
    PRAGMA journal_mode=WAL;
  `);

  // Ensure that all the tables we need have been created
  await createTables(database);

  return database;
}

/**
 * Process signal handler which ensures the SQLite database is closed cleanly before the Node.js
 * process exits.
 */
async function closeDatabase() {
  console.log('Closing SQLite database...');

  const db = await database;
  await db.close();

  console.log('SQLite database closed.');
  process.exit(0);
}

// Ensure that we cleanly close the database when the Node.js process exits
if (process.env.NEXT_MANUAL_SIG_HANDLE) {
  process.on('SIGHUP', closeDatabase);
  process.on('SIGINT', closeDatabase);
  process.on('SIGQUIT', closeDatabase);
  process.on('SIGTERM', closeDatabase);
  process.on('SIGTSTP', closeDatabase);
}

export { database };
