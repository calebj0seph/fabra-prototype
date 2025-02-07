import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import type { ModelPartsDefinition } from '../models/types';

interface PartPickerProps {
  /**
   * The parts of the model that can be selected. Each part has a name displayed to the user and an
   * ID used to identify it.
   */
  parts: ModelPartsDefinition<string>;
  /**
   * The ID of the currently selected model part, or `null` if no part is selected.
   */
  selectedPart: string | null;
  /**
   * A callback that is called when a part is selected.
   *
   * @param partId The ID of the part that was selected.
   */
  onPartSelected: (partId: string) => void;
}

/**
 * A component that displays a list of parts that can be selected on the editor model. Each part can
 * be clicked to select it.
 */
export function PartPicker({
  parts,
  selectedPart,
  onPartSelected,
}: PartPickerProps) {
  return (
    <Table
      size="small"
      sx={{
        userSelect: 'none',
      }}
    >
      <TableBody>
        {Object.values(parts).map((part) => (
          <TableRow
            key={part.id}
            sx={{ cursor: 'pointer' }}
            hover
            selected={selectedPart === part.id}
            onClick={() => {
              onPartSelected(part.id);
            }}
          >
            <TableCell>{part.name}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
