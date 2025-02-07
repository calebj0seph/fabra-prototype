import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';

import { editorMaterials, type EditorMaterial } from '../materials/materials';

export interface MaterialPickerProps {
  /**
   * The currently selected material.
   */
  value?: EditorMaterial;
  /**
   * Whether the picker is disabled.
   */
  disabled?: boolean;
  /**
   * A callback that is called when a material is selected.
   *
   * @param value The ID of the material that was selected
   */
  onChange: (value: EditorMaterial) => void;
}

/**
 * A component that allows the user to select a material from a list of available materials.
 */
export function MaterialPicker({
  value,
  disabled,
  onChange,
}: MaterialPickerProps) {
  return (
    <FormControl size="small" disabled={disabled} fullWidth>
      {disabled && (
        <InputLabel id="material-picker-label">Select a part first</InputLabel>
      )}
      <Select
        labelId={disabled ? 'material-picker-label' : undefined}
        value={disabled || !value ? '' : value}
        onChange={(event) => {
          onChange(event.target.value as EditorMaterial);
        }}
      >
        {editorMaterials.map(({ id, name }) => (
          <MenuItem key={id} value={id}>
            {name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
