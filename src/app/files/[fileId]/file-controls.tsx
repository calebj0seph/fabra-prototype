'use client';

import Link from 'next/link';

import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useState, useTransition } from 'react';

import { updateFileTitleAction } from '@/lib/files/actions';
import type { File } from '@/lib/db/types';

/**
 * Props for the file controls component.
 */
interface FileControlsProps {
  /**
   * The file object containing at least the `id` and `title`.
   */
  file: Pick<File, 'id' | 'title'>;
}

/**
 * A floating panel in the top-left corner containing a back button and an editable file title.
 */
export default function FileControls({ file }: FileControlsProps) {
  // The current value in the field and the last known successfully persisted title
  const [title, setTitle] = useState<{
    currentTitle: string | null;
    confirmedTitle: string | null;
  }>({
    currentTitle: file.title,
    confirmedTitle: file.title,
  });

  // A transition to allow us to know whether there are any pending title updates
  const [isSaving, startTransition] = useTransition();

  // Whether the input is currently focused
  const [isFocused, setIsFocused] = useState(false);

  // When not focused and the title is `null`, display "Untitled". Otherwise use the actual title.
  const showUntitled = !isFocused && title.currentTitle === null;
  const displayValue = showUntitled ? 'Untitled' : (title.currentTitle ?? '');

  const handleFocus = () => {
    setIsFocused(true);
  };

  // Update the title on the backend when unfocusing the input
  const handleBlur = () => {
    setIsFocused(false);

    const newTitle = title.currentTitle;
    startTransition(async () => {
      try {
        await updateFileTitleAction(file.id, newTitle);

        // Update the confirmed title if the update was successful
        startTransition(() =>
          setTitle((prevTitle) => ({
            ...prevTitle,
            confirmedTitle: newTitle,
          })),
        );
      } catch (_error) {
        // If the update failed, revert to the last confirmed title
        startTransition(() =>
          setTitle((prevTitle) => ({
            ...prevTitle,
            currentTitle: prevTitle.confirmedTitle,
          })),
        );
      }
    });
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        top: 16,
        left: 16,
        width: 300,
        padding: 2,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <IconButton
        component={Link}
        href="/files"
        size="small"
        sx={{ marginRight: 1 }}
      >
        <ArrowBackIcon />
      </IconButton>
      <TextField
        value={displayValue}
        onChange={(e) =>
          setTitle((prevTitle) => ({
            ...prevTitle,
            // Set the current title to `null` if the input is empty
            currentTitle: e.target.value === '' ? null : e.target.value,
          }))
        }
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoComplete="off"
        variant="outlined"
        size="small"
        slotProps={{
          input: {
            sx: {
              // Don't display an outline unless hovered or focused
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'transparent',
              },
              // Use a grey colour when untitled
              color: showUntitled ? 'text.disabled' : 'text.primary',
            },
            // Show a loading spinner when saving the title
            endAdornment: isSaving ? (
              <InputAdornment position="end">
                <CircularProgress size="1.25rem" sx={{ color: 'text.primary' }} />
              </InputAdornment>
            ) : undefined,
          },
        }}
        sx={{
          flex: 1,
        }}
      />
    </Paper>
  );
}
