'use server';

import 'server-only';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import { getAuthenticatedUser, createSession } from '../db/queries';

import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from './constants';

/**
 * Represents the current state of the login action.
 */
export interface LoginActionState {
  /**
   * `false` if the login failed, `null` if the login form has not been submitted yet.
   */
  success: false | null;
}

/**
 * Server action to process logins.
 *
 * Reads the FormData to get the provided email and password, validates credentials, creates a
 * session if valid, sets a secure auth token cookie, and then finally redirects to the files page.
 *
 * @param formData The submitted form data from the login form.
 */
export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();

  if (!email || !password) {
    return { success: false };
  }

  const user = await getAuthenticatedUser(email, password);
  if (!user) {
    return { success: false };
  }

  const session = await createSession(user.id);
  cookies().set(AUTH_COOKIE_NAME, session.token, {
    ...AUTH_COOKIE_OPTIONS,
    expires: session.expiry,
  });

  redirect('/files');
}
