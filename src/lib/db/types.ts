/**
 * Represents a user account.
 */
export interface User {
  /**
   * Unique identifier for the user.
   */
  id: number;
  /**
   * When the account was created.
   */
  created: Date;
  /**
   * The user's email address.
   */
  email: string;
  /**
   * The user's preferred display name.
   */
  displayName: string;
  /**
   * 64-byte binary scrypt password hash.
   */
  passwordHash: Buffer;
  /**
   * 64-byte binary salt for scrypt.
   */
  passwordSalt: Buffer;
}

/**
 * Raw database row for a user.
 */
export interface UserRow {
  id: number;
  created: number;
  email: string;
  display_name: string;
  password_hash: Buffer;
  password_salt: Buffer;
}

/**
 * Converts a database row into a {@link User} object.
 *
 * @param row The database row containing user data
 * @returns A {@link User} object
 */
export function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    created: new Date(row.created * 1000),
    email: row.email,
    displayName: row.display_name,
    passwordHash: row.password_hash,
    passwordSalt: row.password_salt,
  };
}

/**
 * Represents a session for an authenticated user.
 */
export interface Session {
  /**
   * Unique identifier for the session.
   */
  id: number;
  /**
   * A 256-bit session token stored as a hex string.
   */
  token: string;
  /**
   * When the session expires.
   */
  expiry: Date;
  /**
   * The ID of the user associated with this session.
   */
  userId: number;
}

/**
 * Raw database row for a session.
 */
export interface SessionRow {
  id: number;
  user_id: number;
  token: string;
  expiry: number;
}

/**
 * Represents a design file.
 */
export interface File {
  /**
   * Unique identifier for the file.
   */
  id: number;
  /**
   * When the file was created.
   */
  created: Date;
  /**
   * The user ID of the file’s author.
   */
  userID: number;
  /**
   * The title of the file, or `null` if no title is set yet.
   */
  title: string | null;
}

/**
 * Raw database row for a file.
 */
export interface FileRow {
  id: number;
  created: number;
  user_id: number;
  title: string;
}

/**
 * Converts a database row into a File object.
 *
 * @param row The database row containing file data
 * @returns A {@link File} object
 */
export function rowToFile(row: FileRow): File {
  return {
    id: row.id,
    created: new Date(row.created * 1000),
    userID: row.user_id,
    title: row.title,
  };
}
