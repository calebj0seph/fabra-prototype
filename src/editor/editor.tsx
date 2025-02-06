'use client';

import React, { Suspense } from 'react';

import { Canvas } from '@react-three/fiber';

import { CameraControls } from './camera-controls';
import { Lighting } from './lighting';
import { Shirt, shirtParts } from './models/shirt';
import { SelectionEditor } from './ui/selection-editor';

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
        <CameraControls parts={shirtParts} />
        <Lighting />
        <Suspense fallback={null}>
          <Shirt
            back="jeans"
            front="jeans"
            neckRim="jeans"
            leftSleeve="jeans"
            rightSleeve="jeans"
          />
        </Suspense>
      </Canvas>
      <SelectionEditor parts={shirtParts} />
    </div>
  );
}
