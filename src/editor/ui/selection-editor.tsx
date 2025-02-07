import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';

import type { ModelPartMaterials, ModelPartsDefinition } from '../models/types';

import type { EditorMaterial } from '../materials/materials';

import { PartPicker } from './part-picker';
import { MaterialPicker } from './material-picker';

interface SelectionEditorProps {
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
   * The materials that are currently assigned to the parts of the model.
   */
  partMaterials: ModelPartMaterials<string>;
  /**
   * A callback that is called when a part is selected.
   *
   * @param partId The ID of the part that was selected.
   */
  onPartSelected: (partId: string) => void;
  /**
   * A callback that is called when a material is selected for a part.
   *
   * @param partId The ID of the part to change the material for.
   * @param material The ID of the material to apply to the part.
   */
  onPartMaterialChange: (partId: string, material: EditorMaterial) => void;
}

/**
 * A component that allows the user to select a part of the model and change its material.
 */
export function SelectionEditor({
  parts,
  selectedPart,
  partMaterials,
  onPartSelected,
  onPartMaterialChange,
}: SelectionEditorProps) {
  const { spacing } = useTheme();

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        width: 250,
        padding: 2,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <Typography variant="h6">Edit materials</Typography>
      <Typography variant="subtitle2">Parts</Typography>
      <Box
        sx={{
          width: `calc(100% + ${spacing(4)})`,
          marginLeft: -2,
          marginRight: -2,
        }}
      >
        <PartPicker
          parts={parts}
          selectedPart={selectedPart}
          onPartSelected={onPartSelected}
        />
      </Box>
      <Typography variant="subtitle2">Materials</Typography>
      <MaterialPicker
        value={selectedPart ? partMaterials[selectedPart] : undefined}
        disabled={selectedPart === null}
        onChange={(material) => {
          if (selectedPart) {
            onPartMaterialChange(selectedPart, material);
          }
        }}
      />
    </Paper>
  );
}
