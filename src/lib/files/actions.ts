'use server';

import 'server-only';

import { redirect } from 'next/navigation';

import { getLoggedInUser } from '../auth/utils';
import { createFile, updateFileTitle } from '../db/queries';

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
export async function updateFileTitleAction(fileId: number, newTitle: string | null) {
  const user = await getLoggedInUser();
  await updateFileTitle(user.id, fileId, newTitle);
}
