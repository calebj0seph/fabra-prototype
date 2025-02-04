import Link from 'next/link';

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import type { File } from '@/lib/db/types';

/**
 * Props for the files list component.
 */
export interface FilesListProps {
  /**
   * The list of files to display.
   */
  files: File[];
}

/**
 * Displays a table of files. Each row shows the created date and title of the file, and can be
 * clicked to open the editor for that file.
 */
export function FilesList({ files }: FilesListProps) {
  return (
    <TableContainer component={Paper}>
      {/* In order to make an entire row an <a> link, we can't use normal table elements as it'll
       * cause validation errors in React */}
      <Table component="div">
        <TableHead component="div">
          <TableRow component="div">
            <TableCell component="div">Title</TableCell>
            <TableCell component="div" align="right">
              Created
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody component="div">
          {files.map((file) => (
            <TableRow
              key={file.id}
              component={Link}
              href={`/files/${file.id}`}
              hover
              sx={{
                textDecoration: 'none',
              }}
            >
              <TableCell component="div">
                <Typography
                  color={file.title === null ? 'textDisabled' : 'textPrimary'}
                >
                  {file.title ?? 'Untitled'}
                </Typography>
              </TableCell>
              <TableCell component="div" align="right">
                {file.created.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
