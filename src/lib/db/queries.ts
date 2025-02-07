import 'server-only';

import { promisify } from 'util';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';

import { database } from './setup';
import {
  rowToFile,
  rowToUser,
  type User,
  type UserRow,
  type Session,
  type SessionRow,
  type FileRow,
  type File,
} from './types';

const scrypt = promisify(scryptCallback);

/**
 * Retrieves a user by email and verifies the provided password using scrypt.
 *
 * The function first queries the database for a user with the given email. It then computes a
 * scrypt-derived hash for the provided plaintext password using the stored salt. If the computed
 * hash matches the stored hash, the authenticated {@link User} object is returned; otherwise,
 * `null` is returned.
 *
 * @param email The email address of the user
 * @param password The plaintext password to verify
 * @returns The authenticated {@link User} object, or null if authentication fails
 */
export async function getAuthenticatedUser(
  email: string,
  password: string,
): Promise<User | null> {
  const db = await database;
  const row = await db.get<UserRow>(
    'SELECT * FROM users WHERE email = ?',
    email,
  );
  if (!row) {
    return null;
  }

  const user = rowToUser(row);
  // Compute the scrypt hash using the provided password and the stored salt
  const derivedHash = (await scrypt(password, user.passwordSalt, 64)) as Buffer;

  // Use timingSafeEqual to guard against timing attacks
  if (timingSafeEqual(derivedHash, user.passwordHash)) {
    return user;
  }

  return null;
}

/**
 * Retrieves a user by ID.
 *
 * @param userId The ID of the user to retrieve
 * @returns The {@link User} object, or null if no user is found
 */
export async function getUser(userId: number) {
  const db = await database;
  const row = await db.get<UserRow>('SELECT * FROM users WHERE id = ?', userId);
  if (!row) {
    return null;
  }

  return rowToUser(row);
}

/**
 * Creates a new session for the specified user.
 *
 * This function generates a random 256-bit hex token, sets the session expiry to 30 days from the
 * current Unix timestamp, inserts the session into the database, and returns the created
 * {@link Session} object.
 *
 * @param userId The ID of the user for whom the session is being created
 * @returns The newly created {@link Session}
 */
export async function createSession(userId: number): Promise<Session> {
  const token = randomBytes(32).toString('hex');
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + 30 * 24 * 60 * 60; // 30 days in seconds

  const db = await database;
  const result = await db.run(
    'INSERT INTO sessions (user_id, token, expiry) VALUES (?, ?, ?)',
    userId,
    token,
    expiry,
  );
  return { id: result.lastID, token, expiry: new Date(expiry * 1000), userId };
}

/**
 * Validates a given session token.
 *
 * This function queries the database for a session with the provided token and an expiry timestamp
 * greater than or equal to the current time. If a valid session is found, its expiry is updated to
 * 30 days from now and the associated {@link Session} is returned. If no valid session is found,
 * `null` is returned.
 *
 * @param token The session token
 * @returns The associated {@link Session} if the session is valid, otherwise null
 */
export async function validateSession(token: string): Promise<Session | null> {
  const db = await database;
  const now = Date.now() / 1000;

  // Find a session that hasn't expired
  const sessionRow = await db.get<SessionRow>(
    // Use a join to ensure that the user exists
    `SELECT sessions.*
      FROM sessions
      INNER JOIN users ON sessions.user_id = users.id
      WHERE token = ? AND expiry >= ?`,
    token,
    now,
  );
  if (!sessionRow) {
    return null;
  }

  // Extend the session expiry to be 30 days from now
  const newExpiry = now + 30 * 24 * 60 * 60;
  await db.run(
    'UPDATE sessions SET expiry = ? WHERE id = ?',
    newExpiry,
    sessionRow.id,
  );

  return {
    id: sessionRow.id,
    token,
    expiry: new Date(newExpiry * 1000),
    userId: sessionRow.user_id,
  };
}

/**
 * Retrieves all design files created by the given user.
 *
 * @param userID The ID of the user whose files are being retrieved
 * @returns An array of {@link File} objects
 */
export async function getFilesForUser(userID: number): Promise<File[]> {
  const db = await database;
  const rows = await db.all<FileRow>(
    'SELECT * FROM files WHERE user_id = ?',
    userID,
  );
  return rows.map(rowToFile);
}

/**
 * Retrieves a file by its ID for a given user.
 *
 * @param userID The ID of the user who owns the file
 * @param fileID The ID of the file to get
 * @returns The {@link File} if found (and owned by the user), otherwise null
 */
export async function getFileByID(
  userID: number,
  fileID: number,
): Promise<File | null> {
  const db = await database;
  const row = await db.get<FileRow>(
    'SELECT * FROM files WHERE id = ? AND user_id = ?',
    fileID,
    userID,
  );
  return row ? rowToFile(row) : null;
}

/**
 * Creates a new blank design file for the given user.
 *
 * @param userID The ID of the user creating the file
 * @returns The newly created {@link File}
 */
export async function createFile(userID: number): Promise<File> {
  const db = await database;

  const now = Date.now() / 1000;
  const result = await db.run(
    'INSERT INTO files (created, user_id) VALUES (?, ?)',
    now,
    userID,
  );

  return {
    id: result.lastID,
    created: new Date(now * 1000),
    userID,
    title: null,
  };
}

/**
 * Updates the title of a file owned by the specified user.
 *
 * @param userID The ID of the user who owns the file
 * @param fileID The ID of the file to update
 * @param newTitle The new title for the file
 * @returns The updated {@link File}
 */
export async function updateFileTitle(
  userID: number,
  fileID: number,
  newTitle: string | null,
) {
  const db = await database;
  const result = await db.run(
    'UPDATE files SET title = ? WHERE id = ? AND user_id = ?',
    newTitle,
    fileID,
    userID,
  );
  if (!result.changes || result.changes === 0) {
    throw new Error('Update failed: File not found or not owned by user.');
  }
}

/**
 * Retrieves the data for a file by its ID owned by the specified user.
 *
 * @param userID The ID of the user who owns the file
 * @param fileID The ID of the file to get data for
 * @returns The file data as a Buffer, or `null` if data for the file is not found or the file is
 * not owned by the user
 */
export async function getFileDataByID(
  userID: number,
  fileID: number,
): Promise<Buffer | null> {
  const db = await database;
  const row = await db.get<{ data: Buffer }>(
    `
    SELECT file_data.data
      FROM file_data
      INNER JOIN files ON file_data.file_id = files.id
      WHERE files.id = ? AND files.user_id = ?
    `,
    fileID,
    userID,
  );
  return row ? row.data : null;
}

/**
 * Sets the data for a file by its ID, creating a new record if one does not already exist.
 *
 * @param fileID The ID of the file to set data for
 * @param data The data to set
 */
export async function setFileData(fileID: number, data: Buffer): Promise<void> {
  const db = await database;
  await db.run(
    'INSERT OR REPLACE INTO file_data (file_id, data) VALUES (?, ?)',
    fileID,
    data,
  );
}
