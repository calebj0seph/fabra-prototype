import { redirect } from 'next/navigation';

import Box from '@mui/material/Box';

import { getLoggedInUser } from '@/lib/auth/utils';
import { getFileByID, getFileDataByID } from '@/lib/db/queries';

import Editor from '@/editor/editor';

import FileControls from './file-controls';

/**
 * Props for the file page.
 */
interface FilePageProps {
  /**
   * The route parameters containing the file ID to display.
   */
  params: { fileId: string };
}

/**
 * A page that allows an individual file to be edited.
 */
export default async function FilePage({ params }: FilePageProps) {
  const fileId = parseInt(params.fileId, 10);
  const currentUser = await getLoggedInUser();
  const file = await getFileByID(currentUser.id, fileId);
  if (!file) {
    // Redirect if the file does not exist or does not belong to the user
    redirect('/files');
  }

  // For now we'll just hard-code the shirt model as being edited, but ideally this would be loaded
  // from the database
  const model = 'shirt' as const;

  // Get the saved file data which defines the materials for different parts of the model, if any
  const fileData = await getFileDataByID(currentUser.id, fileId);
  const savedPartMaterials = fileData
    ? JSON.parse(fileData.toString('utf8'))
    : null;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
      }}
    >
      <Editor
        fileId={fileId}
        model={model}
        savedPartMaterials={savedPartMaterials}
      />
      <FileControls file={file} />
    </Box>
  );
}
