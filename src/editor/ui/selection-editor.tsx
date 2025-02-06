import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { useSnapshot } from 'valtio';

import { selectionState } from './state';

interface SelectionEditorProps {
  /**
   * The parts of the model that can be selected. Each part has a name displayed to the user and an
   * ID used to identify it.
   */
  parts: ReadonlyArray<{ name: string; id: string }>;
}

/**
 * A component that allows the user to select a part of the model and change its material.
 */
export function SelectionEditor({ parts }: SelectionEditorProps) {
  const { selectedPart } = useSnapshot(selectionState);

  // TODO: Add material editing
  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        width: 200,
        padding: 2,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Table size="small" sx={{ userSelect: 'none' }}>
        <TableHead>
          <TableRow>
            <TableCell>Select part</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {parts.map((part) => (
            <TableRow
              key={part.id}
              sx={{ cursor: 'pointer' }}
              hover
              selected={selectedPart === part.id}
              onClick={() => {
                // Set the selected part, or deselect it if it's already selected
                selectionState.selectedPart =
                  part.id === selectionState.selectedPart ? null : part.id;
              }}
            >
              <TableCell>{part.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
