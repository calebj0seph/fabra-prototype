import { Vector3 } from 'three';

/**
 * Provides fixed lighting for the scene.
 */
export function Lighting() {
  // Define the directional light in terms of a direction and distance from the origin
  const directionalLightDirection = new Vector3(0.75, 1, 0.5)
    .normalize()
    .multiplyScalar(20);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        castShadow
        intensity={2}
        position={directionalLightDirection}
        // Since we're going for quite soft shadows, we don't need a very high resolution for the
        // shadow map
        shadow-mapSize={[256, 256]}
        shadow-bias={-0.0005}
        // Blur shadows to make them softer
        shadow-radius={2}
        shadow-blurSamples={16}
        // Limit the depth of the shadow camera to reduce depth buffer artifacts
        shadow-camera-near={1}
        shadow-camera-far={50}
      />
    </>
  );
}
