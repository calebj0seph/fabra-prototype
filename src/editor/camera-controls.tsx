import { useEffect, useRef } from 'react';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { useThree, extend, type ReactThreeFiber } from '@react-three/fiber';

// Make OrbitControls available as a JSX element, since it's not a built-in Three.js class
extend({ OrbitControls });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      orbitControls: ReactThreeFiber.Object3DNode<
        OrbitControls,
        typeof OrbitControls
      >;
    }
  }
}

/**
 * An invisible component that allows the camera to be moved with the mouse/keyboard.
 */
export function CameraControls() {
  const invalidate = useThree((state) => state.invalidate);
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);

  const orbitControlsRef = useRef<OrbitControls | null>(null);

  // Since we're using on-demand rendering, we need to manually trigger a re-render when the orbit
  // controls change the camera
  useEffect(() => {
    // Initially position the camera
    camera.position.set(0, 0, 1);

    const orbitControls = orbitControlsRef.current;
    const onOrbitChange = () => invalidate();

    orbitControls?.addEventListener('change', onOrbitChange);
    return () => orbitControls?.removeEventListener('change', onOrbitChange);
  }, []);

  return (
    <orbitControls ref={orbitControlsRef} args={[camera, gl.domElement]} />
  );
}
