'use server';

import 'server-only';

import { redirect } from 'next/navigation';

import { getLoggedInUser } from '../auth/utils';
import {
  createFile,
  getFileByID,
  setFileData,
  updateFileTitle,
} from '../db/queries';

/**
 * Creates a new design file and redirects the user to the editor for that file.
 */
export async function createFileAction() {
  const user = await getLoggedInUser();
  const file = await createFile(user.id);

  redirect(`/files/${file.id}`);
}

/**
 * Updates the title of a file.
 *
 * @param fileId The ID of the file to update.
 * @param newTitle The updated title.
 */
export async function updateFileTitleAction(
  fileId: number,
  newTitle: string | null,
) {
  const user = await getLoggedInUser();
  await updateFileTitle(user.id, fileId, newTitle);
}

/**
 * Sets the data for a file, overwriting any existing data.
 *
 * @param fileId The ID of the file to update.
 * @param data The new data to set.
 */
export async function setFileDataAction<T extends Record<string, unknown>>(
  fileId: number,
  data: T,
) {
  const user = await getLoggedInUser();

  // Validate that the file exists and the user owns it
  const file = await getFileByID(user.id, fileId);
  if (!file) {
    throw new Error('File not found');
  }

  // Save the data to the database as a JSON string (the column is a BLOB to allow for potentially
  // using a binary format in the future)
  await setFileData(fileId, Buffer.from(JSON.stringify(data), 'utf8'));
}
