import 'server-only';

import type { Metadata } from 'next';
import { Kumbh_Sans } from 'next/font/google';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';

import { theme } from './material-ui-theme';

const font = Kumbh_Sans({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-kumbh-sans',
});

export const metadata: Metadata = {
  title: 'Fabra Prototype',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={font.variable}>
        {/* AppRouterCacheProvider ensures that the CSS emitted by Material UI is correctly rendered
         * inside of <head> in the HTML generated by Next.js on the server */}
        <AppRouterCacheProvider>
          {/* Use our own Material UI theme */}
          <ThemeProvider theme={theme}>
            {/* Normalize CSS */}
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
