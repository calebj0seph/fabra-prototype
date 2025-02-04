import 'server-only';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import React from 'react';

import type { File } from '@/lib/db/types';
import { getFilesForUser } from '@/lib/db/queries';
import { getLoggedInUser } from '@/lib/auth/utils';

import { FilesList } from './files-list';
import { NoFiles } from './no-files';
import { CreateFileButton } from './create-file-button';

/**
 * A page that lists all of the current user's design files.
 */
export default async function FilesPage() {
  // Fetch the files for the current user
  const currentUser = await getLoggedInUser();
  const files: File[] = await getFilesForUser(currentUser.id);

  return (
    <Container maxWidth="md" sx={{ marginTop: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 3,
        }}
      >
        <Typography variant="h4">Your designs</Typography>
        <CreateFileButton />
      </Box>
      {files.length > 0 ? <FilesList files={files} /> : <NoFiles />}
    </Container>
  );
}
