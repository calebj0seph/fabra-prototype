'use client';

import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

import { useState } from 'react';

import { createFileAction } from '@/lib/files/actions';

/**
 * A button that creates a new design file when clicked. Immediately redirects the user to the new
 * file after creation.
 */
export function CreateFileButton() {
  const [creating, setCreating] = useState(false);

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={creating ? undefined : <AddIcon />}
      disabled={creating}
      loading={creating}
      loadingPosition="start"
      onClick={() => {
        setCreating(true);

        createFileAction().then(() => {
          // This action should always redirect to the new file, but in case it fails, re-enable the
          // button
          setCreating(false);
        });
      }}
    >
      New Design
    </Button>
  );
}
