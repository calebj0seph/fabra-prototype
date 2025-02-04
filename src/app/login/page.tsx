import 'server-only';

import type { Metadata } from 'next/types';

import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Login - Fabra Prototype',
};

/**
 * The login screen.
 *
 * @remarks This is the only page in the application that is not behind the authentication
 * middleware, so be careful not to expose any sensitive information here.
 */
export default function LoginPage() {
  return <LoginForm />;
}
