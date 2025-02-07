import { Shirt, shirtParts } from './shirt';
import type { ModelProps } from './types';

/**
 * The models that can be edited in the 3D design editor.
 */
export const editorModels = {
  shirt: {
    component: Shirt as React.ComponentType<ModelProps<string>>,
    parts: shirtParts,
  },
} as const;

/**
 * Represents a model that can be edited in the 3D design editor.
 */
export type EditorModel = keyof typeof editorModels;
