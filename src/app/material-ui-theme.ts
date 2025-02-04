'use client';

import { createTheme } from '@mui/material/styles';
import { pink, teal } from '@mui/material/colors';

const theme = createTheme({
  typography: {
    // Instead of letting Material UI load its own font, we make use of Next.js' optimised font
    // loading in the root layout.tsx file and simply reference the font here
    fontFamily: `var(--font-kumbh-sans)`,
    // Bump the default font weights up, since this font looks a bit thin
    fontWeightLight: 400,
    fontWeightRegular: 500,
    fontWeightMedium: 700,
    fontWeightBold: 900,
    // Get rid of the default uppercase buttons that Material UI uses
    button: {
      textTransform: 'none',
      fontSize: '1rem',
    },
  },
  colorSchemes: {
    // Enable dark mode. This will be used if the system preference is set to dark mode.
    dark: {
      palette: {
        primary: pink,
        secondary: teal,
      },
    },
    light: {
      palette: {
        primary: pink,
        secondary: teal,
      },
    },
  },
  components: {
    MuiTableBody: {
      styleOverrides: {
        root: {
          // Hide the bottom border of the last row in a table
          '& > *:last-child > *': {
            borderBottom: 0,
          },
        },
      },
    },
  },
});

export { theme };
