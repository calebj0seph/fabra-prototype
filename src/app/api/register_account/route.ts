import 'server-only';

import { createAccount } from '@/lib/db/queries';

/**
 * Creates a new user account with the given `email`, `displayName` and `password` in the JSON body.
 */
export async function POST(request: Request) {
  // Validate the request body
  let body: unknown;
  try {
    body = await request.json();
  } catch (_e) {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return Response.json({ error: 'Missing body' }, { status: 400 });
  }

  if (!('email' in body) || !body.email || typeof body.email !== 'string') {
    return Response.json({ error: 'Missing email' }, { status: 400 });
  }

  if (!('displayName' in body) || !body.displayName || typeof body.displayName !== 'string') {
    return Response.json({ error: 'Missing display name' }, { status: 400 });
  }

  if (!('password' in body) || !body.password || typeof body.password !== 'string') {
    return Response.json({ error: 'Missing password' }, { status: 400 });
  }

  // Create the user account
  const user = await createAccount(body.email, body.displayName, body.password);
  if (!user) {
    return Response.json({ error: 'Account already exists' }, { status: 409 });
  }

  return new Response(null, { status: 201 });
}
