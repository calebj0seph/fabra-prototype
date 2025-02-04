'use client';

import React from 'react';

import { Canvas } from '@react-three/fiber';

import { CameraControls } from './camera-controls';
import { Lighting } from './lighting';

// TODO: Remove this test geometry
function TestGeometry() {
  return (
    <>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
      >
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </>
  );
}

/**
 * The entrypoint to the 3D design editor.
 */
export default function Editor() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        // Use on-demand rendering to avoid high GPU usage when idle
        frameloop="demand"
        // Use variance shadow maps which tend to do a better job with soft shadows
        shadows="variance"
      >
        <CameraControls />
        <Lighting />
        <TestGeometry />
      </Canvas>
    </div>
  );
}
