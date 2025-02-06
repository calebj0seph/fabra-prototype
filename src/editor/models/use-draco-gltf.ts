import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { useLoader } from '@react-three/fiber';

// Since we're using Draco compression, we need to provide a path to the WASM binaries used by the
// DRACOLoader. These exist in the /public/draco/ directory.
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

/**
 * A simple wrapper around `useLoader` that allows a GLTF with Draco compression to be loaded.
 *
 * @param url The URL of the GLTF file to load.
 * @returns The loaded GLTF scene.
 */
export function useDracoGltf(url: string) {
  return useLoader(GLTFLoader, url, (loader) => {
    // Reuse the same DRACOLoader instance for all GLTFLoader instances
    loader.setDRACOLoader(dracoLoader);
  });
}
