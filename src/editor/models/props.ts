import type { EditorMaterial } from '../materials/materials';

/**
 * Represents the materials that can be applied to different parts of a model.
 *
 * @template T The names of the model parts that can have different materials applied to them.
 */
export type ModelProps<T extends string> = {
  /**
   * The material to apply to this part of the model.
   */
  [key in T]: EditorMaterial;
};
