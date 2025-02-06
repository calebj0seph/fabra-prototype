import { useEffect, useRef } from 'react';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { Quaternion, Spherical } from 'three';

import {
  useThree,
  extend,
  type ReactThreeFiber,
  useFrame,
} from '@react-three/fiber';
import { subscribeKey } from 'valtio/utils';

import { selectionState } from './ui/state';
import { lerpSpherical, materialEase, sphericalToQuaternion } from './utils';

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

export interface CameraControlsProps {
  /**
   * The parts of the model that can be selected. Each part defines the spherical coordinates that
   * the camera should move to when the part is selected.
   */
  parts: ReadonlyArray<{
    camera: { distance: number; phi: number; theta: number };
    id: string;
  }>;
}

/**
 * An invisible component that allows the camera to be moved with the mouse/keyboard. Also
 * responsible for moving the camera when the selection changes.
 */
export function CameraControls({ parts }: CameraControlsProps) {
  const invalidate = useThree((state) => state.invalidate);
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);

  const orbitControlsRef = useRef<OrbitControls | null>(null);

  // Since we're using on-demand rendering, we need to manually trigger a re-render when the orbit
  // controls change the camera
  useEffect(() => {
    // Initially position the camera
    camera.position.set(0, 0, 0.75);

    const orbitControls = orbitControlsRef.current;
    const onOrbitChange = () => invalidate();

    orbitControls?.listenToKeyEvents(window);
    orbitControls?.addEventListener('change', onOrbitChange);
    return () => orbitControls?.removeEventListener('change', onOrbitChange);
  }, []);

  // Variables to keep track of the camera animation state
  const isAnimating = useRef(false);
  const cameraStartPosition = useRef(new Spherical());
  const cameraEndPosition = useRef(new Spherical());
  const cameraStartQuaternion = useRef(new Quaternion());
  const cameraEndQuaternion = useRef(new Quaternion());
  const animationStartTime = useRef(0);
  const animationDuration = 500;

  // Subscribe to when the selected part changes. When this happens, animate the camera to the new
  // camera position of the selected part.
  useEffect(() => {
    const unsubscribe = subscribeKey(
      selectionState,
      'selectedPart',
      (selectedPart) => {
        if (!selectedPart) {
          return;
        }

        const part = parts.find((p) => p.id === selectedPart);
        if (!part) {
          return;
        }

        // Disable orbit controls while animating
        if (orbitControlsRef.current) {
          orbitControlsRef.current.enabled = false;
        }

        // Store the starting position and rotation of the camera
        cameraStartPosition.current.setFromCartesianCoords(
          camera.position.x,
          camera.position.y,
          camera.position.z,
        );
        cameraStartQuaternion.current.copy(camera.quaternion);

        // Calculate the ending position and rotation of the camera
        cameraEndPosition.current = new Spherical(
          part.camera.distance,
          // Degrees to radians
          (part.camera.phi * Math.PI) / 180,
          (part.camera.theta * Math.PI) / 180,
        );
        cameraEndQuaternion.current = sphericalToQuaternion(
          cameraEndPosition.current,
        );

        // Keep track of when the animation started
        animationStartTime.current = performance.now();

        // Start the animation
        isAnimating.current = true;
        invalidate();
      },
    );

    return () => unsubscribe();
  }, []);

  // Animate the camera position and rotation, avoiding React re-renders
  useFrame(({ camera, invalidate }) => {
    if (!isAnimating.current) {
      // Do nothing if the animation isn't running
      return;
    }

    const currentTime = performance.now();
    const elapsedTime = currentTime - animationStartTime.current;

    if (elapsedTime >= animationDuration) {
      // Finish the animation
      camera.position.setFromSpherical(cameraEndPosition.current);
      camera.quaternion.copy(cameraEndQuaternion.current);

      // Re-enable orbit controls
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = true;

        // Reset the target of the orbit controls to the origin, since our predefined camera
        // positions are all centred around the origin
        orbitControlsRef.current.target.set(0, 0, 0);
        orbitControlsRef.current.update();
      }

      isAnimating.current = false;
    } else {
      const t = materialEase(elapsedTime / animationDuration);

      // Interpolate the camera position. We interpolate spherical coordinates so the camera moves
      // in a sphere around the mesh, rather than going from point to point.
      camera.position.setFromSpherical(
        lerpSpherical(
          cameraStartPosition.current,
          cameraEndPosition.current,
          t,
        ),
      );

      // Interpolate the camera rotation
      camera.quaternion.slerpQuaternions(
        cameraStartQuaternion.current,
        cameraEndQuaternion.current,
        t,
      );
    }

    invalidate();
  });

  return (
    <orbitControls ref={orbitControlsRef} args={[camera, gl.domElement]} />
  );
}
