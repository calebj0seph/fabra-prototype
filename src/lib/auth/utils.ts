import 'server-only';

import { headers } from 'next/headers';

import { getUser } from '../db/queries';
import type { User } from '../db/types';

import { INTERNAL_USER_ID_HEADER } from './constants';

/**
 * Returns the currently logged in user, or null if no user is logged in.
 *
 * @remarks This functions relies on the middleware to authenticate the user and set an internal
 * header containing the user ID.
 */
export async function getLoggedInUser(): Promise<User> {
  // Get the currently logged in user. This will be passed in from the middleware after
  // authenticating the user's session token.
  const userId = headers().get(INTERNAL_USER_ID_HEADER);
  if (!userId) {
    // Should never happen, as the middleware will always either set the header or redirect to the
    // login page
    throw new Error('No user ID found in headers');
  }

  const userIdInt = parseInt(userId, 10);
  if (isNaN(userIdInt)) {
    // Should never happen, as the middleware will always either set the header or redirect to the
    // login page
    throw new Error('Invalid user ID found in headers');
  }

  const user = await getUser(userIdInt);
  if (!user) {
    // Should never happen, as when authenticating the session token we validate that the user
    // exists
    throw new Error('User not found');
  }

  return user;
}
