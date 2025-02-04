import 'server-only';

import { redirect } from 'next/navigation';

/**
 * The root page of the application.
 *
 * @remarks Currently unused and redirects to the files page.
 */
export default function HomePage() {
  redirect('/files');
}
