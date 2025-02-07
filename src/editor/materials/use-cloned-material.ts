import { useEffect, useRef } from 'react';
import type { Material } from 'three';

/**
 * Hook which returns a cloned copy of a given material. The cloned material is automatically
 * disposed when the hook is unmounted.
 *
 * @param base The material to clone. If this changes, the cloned material will be recreated with
 * the previous cloned material being disposed.
 * @param onClone A callback that is called with the cloned material when it is created/recreated.
 */
export function useClonedMaterial(
  base: Material,
  onClone: (clonedMaterial: Material) => void,
) {
  const clonedMaterialRef = useRef<Material>();
  const previousBaseRef = useRef<Material>();

  // Clone the base material if `base` changes
  if (previousBaseRef.current !== base) {
    // Clean up the previous cloned material (if any)
    if (clonedMaterialRef.current) {
      clonedMaterialRef.current.dispose();
    }

    previousBaseRef.current = base;
    clonedMaterialRef.current = base.clone();

    onClone(clonedMaterialRef.current);
  }

  // Clean up the cloned material on unmount
  useEffect(() => {
    return () => {
      if (clonedMaterialRef.current) {
        clonedMaterialRef.current.dispose();
      }
    };
  }, []);

  return clonedMaterialRef.current as Material;
}
