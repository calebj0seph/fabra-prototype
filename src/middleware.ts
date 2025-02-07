import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';

import {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
  INTERNAL_USER_ID_HEADER,
} from './lib/auth/constants';

/**
 * The route to which users are redirected if they are not authenticated.
 */
const LOGIN_ROUTE = '/login';

/**
 * Strips internal headers from the given request to prevent the client from being able to specify
 * them. Returns a response with the updated request.
 */
function stripInternalHeaders(request: NextRequest) {
  const strippedHeaders = new Headers(request.headers);
  strippedHeaders.delete(INTERNAL_USER_ID_HEADER);

  return NextResponse.next({
    request: {
      headers: strippedHeaders,
    },
  });
}

/**
 * Middleware that ensures the user is authenticated before allowing access to the app. If the user
 * is not authenticated, they are redirected to the login page.
 */
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === LOGIN_ROUTE) {
    // Allow access to the login page, but make sure to scrub any internal headers to avoid
    // impersonation
    return stripInternalHeaders(request);
  }

  // If there is no authentication token, redirect to the login page
  const authToken = request.cookies.get(AUTH_COOKIE_NAME);
  if (!authToken) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = LOGIN_ROUTE;
    return NextResponse.redirect(loginUrl);
  }

  // Validate the authentication token. We have to do this via an API, since middleware runs on the
  // Edge runtime and can't open the SQLite database directly.
  try {
    const authResponse = await fetch(
      `${request.nextUrl.origin}/api/auth?${new URLSearchParams([['token', authToken.value]])}`,
    );
    if (!authResponse.ok) {
      throw new Error('Unable to validate authentication token');
    }

    const session: unknown = await authResponse.json();
    if (
      !session ||
      typeof session !== 'object' ||
      !('userId' in session) ||
      typeof session?.userId !== 'number' ||
      !('expiry' in session) ||
      typeof session?.expiry !== 'string'
    ) {
      throw new Error('Invalid token validation response');
    }

    // Forward information about the current user to the app via headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(INTERNAL_USER_ID_HEADER, session.userId.toString());

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // Update the authentication token cookie to extend its expiry
    response.cookies.set(AUTH_COOKIE_NAME, authToken.value, {
      ...AUTH_COOKIE_OPTIONS,
      expires: new Date(session.expiry),
    });

    return response;
  } catch (_e) {
    // Could not validate the authentication token, so redirect to the login page
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = LOGIN_ROUTE;
    const response = NextResponse.redirect(loginUrl);

    // Clear the authentication token cookie
    response.cookies.delete(AUTH_COOKIE_NAME);

    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Require authentication on all routes except:
     * - /api (API endpoints)
     * - /_next/static (static files)
     * - /_next/image (image optimization files)
     * - /favicon.ico, /sitemap.xml, /robots.txt (other public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
