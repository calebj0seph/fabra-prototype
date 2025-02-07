import { proxy } from 'valtio';

import type { ModelPartMaterials } from '../models/types';

export interface SelectionState {
  /**
   * The ID of the currently selected model part.
   */
  selectedPart: string | null;
  /**
   * The materials that are currently assigned to the parts of the model.
   */
  partMaterials: ModelPartMaterials<string> | null;
}

/**
 * Represents the state of the current editor selection.
 */
export const selectionState = proxy<SelectionState>({
  selectedPart: null,
  partMaterials: null,
});
