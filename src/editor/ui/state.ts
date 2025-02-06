import { proxy } from 'valtio';

export interface SelectionState {
  /**
   * The ID of the currently selected model part.
   */
  selectedPart: string | null;
}

/**
 * Represents the state of the current editor selection.
 */
export const selectionState = proxy<SelectionState>({ selectedPart: null });
