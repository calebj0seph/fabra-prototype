import type { EditorMaterial } from '../materials/materials';

/**
 * A definition of one part of an editor model.
 */
export interface ModelPartDefinition<T extends string> {
  /**
   * The ID of this part of the model. Must match the key used in {@link ModelPartsDefinition}.
   */
  id: T;
  /**
   * The name of this part of the model, displayed to the user.
   */
  name: string;
  /**
   * The position the camera should swing to when this part is selected, defined in spherical
   * coordinates.
   *
   * @remarks By using spherical coordinates for the camera position of each part, we ensure that
   * the camera is always orbiting around the origin and doesn't end up off-center
   */
  camera: {
    /**
     * How far from the origin the camera should be.
     */
    distance: number;
    /**
     * The angle around the vertical axis the camera should be, in degrees.
     */
    longitude: number;
    /**
     * The angle above/below the horizontal plane the camera should be, in degrees.
     */
    latitude: number;
  };
  /**
   * The default material to apply to this part of the model when a design file is first created.
   */
  defaultMaterial: EditorMaterial;
}

/**
 * A definition of all the parts that an editor model consists of.
 */
export type ModelPartsDefinition<T extends string> = {
  /**
   * The definition for this part of the model.
   */
  [key in T]: ModelPartDefinition<T>;
};

/**
 * A helper function to define the parts of a model in a type-safe way.
 *
 * @param definition The definition of the parts of the model to type check.
 */
export const partDefinition = <T extends string>(
  definition: ModelPartsDefinition<T>,
) => definition;

/**
 * Represents the materials that can be applied to different parts of a model.
 *
 * @template T The names of the model parts that can have different materials applied to them.
 */
export type ModelPartMaterials<T extends string> = {
  /**
   * The material to apply to this part of the model.
   */
  [key in T]: EditorMaterial;
};

/**
 * A helper type to get the {@link ModelPartMaterials} type for a {@link ModelPartsDefinition}.
 */
export type ModelPartMaterialsForDefinition<T> = ModelPartMaterials<
  T extends ModelPartsDefinition<infer X> ? X : never
>;

/**
 * A helper function to get the default materials for all parts of a model.
 *
 * @param parts The parts of the model to get the default materials for.
 */
export const getDefaultPartMaterials = <T extends string>(
  parts: ModelPartsDefinition<T>,
) => {
  const partMaterials: ModelPartMaterials<T> = {} as ModelPartMaterials<T>;

  for (const partId in parts) {
    partMaterials[partId] = parts[partId].defaultMaterial;
  }

  return partMaterials;
};

/**
 * Represents the properties of a model component.
 */
export interface ModelProps<T> {
  /**
   * The materials to apply to different parts of the model.
   */
  partMaterials: ModelPartMaterialsForDefinition<T>;
}
