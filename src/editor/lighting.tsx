import useTheme from '@mui/material/styles/useTheme';

import { Vector3 } from 'three';

/**
 * Provides fixed lighting for the scene.
 */
export function Lighting() {
  // Define the directional light in terms of a direction and distance from the origin
  const directionalLightDirection = new Vector3(0.75, 1, 0.5)
    .normalize()
    .multiplyScalar(20);

  const isDarkTheme = useTheme().palette.mode === 'dark';
  
  // Use less ambient light in dark mode
  const lightMultiplier = isDarkTheme ? 1 : 2;

  return (
    <>
      <ambientLight intensity={0.5 * lightMultiplier} />
      <directionalLight
        castShadow
        intensity={3}
        position={directionalLightDirection}
        // Since we're going for quite soft shadows, we don't need a very high resolution for the
        // shadow map
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.0005}
        // Blur shadows to make them softer
        shadow-radius={1.5}
        shadow-blurSamples={16}
        // Limit the depth of the shadow camera to reduce depth buffer artifacts
        shadow-camera-near={1}
        shadow-camera-far={50}
      />
      {/* Add some warm fill lighting from above */}
      <spotLight
        color="#ffc993"
        intensity={4 * lightMultiplier}
        angle={Math.PI / 6}
        position={[0, 2, -0.5]}
      />
      {/* Add some cool back lighting from behind */}
      <spotLight
        color="#bdd1ff"
        intensity={3 * lightMultiplier}
        angle={Math.PI / 6}
        position={[-2, 0, -1]}
      />
    </>
  );
}
