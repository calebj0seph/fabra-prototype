import 'server-only';

/**
 * The name of the cookie that stores the authentication token.
 */
export const AUTH_COOKIE_NAME = 'auth_token';

/**
 * Options to set on the authentication cookie.
 */
export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
};

/**
 * The header used to communicate the current user ID from the middleware to the app.
 */
export const INTERNAL_USER_ID_HEADER = 'x-current-user-id';
