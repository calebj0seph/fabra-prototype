/**
 * Represents a valid material that can be applied in the editor.
 */
export type EditorMaterial = 'houndstooth' | 'jeans' | 'redplaid';

/**
 * The materials that have a roughness texture.
 */
const materialsWithRoughness: EditorMaterial[] = ['houndstooth'];

/**
 * Represents the URLs of the textures that make up a material.
 */
export interface EditorMaterialTextures {
  /**
   * The URL of the albedo texture.
   */
  albedo: string;
  /**
   * The URL of the occulsion texture.
   */
  ao: string;
  /**
   * The URL of the normal texture.
   */
  normal: string;
  /**
   * The URL of the metalness texture.
   */
  metallic: string;
  /**
   * The URL of the roughness texture, if any.
   */
  roughness?: string;
}

/**
 * Returns the texture URLs for a given material.
 *
 * @param material The material to get the textures for.
 */
export function getMaterialTextures(
  material: EditorMaterial,
): EditorMaterialTextures {
  return {
    albedo: `/materials/${material}/albedo.webp`,
    normal: `/materials/${material}/normal.webp`,
    metallic: `/materials/${material}/metallic.webp`,
    ao: `/materials/${material}/ao.webp`,
    ...(materialsWithRoughness.includes(material)
      ? { roughness: `/materials/${material}/roughness.webp` }
      : null),
  };
}
