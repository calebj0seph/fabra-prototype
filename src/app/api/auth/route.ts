import 'server-only';

import { validateSession } from '@/lib/db/queries';

/**
 * Validates that a given authentication token is valid. Returns session data if the token is valid.
 *
 * @remarks This is only used internally by the middleware to validate the user's session.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  // Check that we have a token
  if (!token) {
    return Response.json({ error: 'Missing token' }, { status: 400 });
  }

  // Validate the authentication token
  const session = await validateSession(token);
  if (!session) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }

  return Response.json(session);
}
