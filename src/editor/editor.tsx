'use client';

import React, { Suspense, useEffect } from 'react';

import { Canvas } from '@react-three/fiber';

import { useSnapshot } from 'valtio';

import { setFileDataAction } from '@/lib/files/actions';

import { CameraControls } from './camera-controls';
import { Lighting } from './lighting';
import { shirtParts } from './models/shirt';
import { SelectionEditor } from './ui/selection-editor';
import {
  getDefaultPartMaterials,
  type ModelPartMaterialsForDefinition,
} from './models/types';
import { selectionState } from './ui/state';
import { editorModels, type EditorModel } from './models/models';

export interface EditorProps {
  /**
   * The ID of the file that is being edited.
   */
  fileId: number;
  /**
   * The model that should be displayed in the editor.
   */
  model: EditorModel;
  /**
   * The saved material assignments for the parts of the model, or `null` if no materials have been
   * saved yet.
   */
  savedPartMaterials: ModelPartMaterialsForDefinition<string> | null;
}

/**
 * The entrypoint to the 3D design editor.
 */
export default function Editor({
  fileId,
  model,
  savedPartMaterials,
}: EditorProps) {
  const { selectedPart, partMaterials } = useSnapshot(selectionState);

  let effectivePartMaterials = partMaterials;
  if (!effectivePartMaterials) {
    // Set the initial part materials before the first render
    effectivePartMaterials =
      savedPartMaterials ?? getDefaultPartMaterials(editorModels[model].parts);

    selectionState.partMaterials = effectivePartMaterials;
  }

  // Clear state on unmount
  useEffect(() => {
    return () => {
      selectionState.selectedPart = null;
      selectionState.partMaterials = null;
    };
  }, []);

  const Model = editorModels[model].component;

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
          <Model partMaterials={effectivePartMaterials} />
        </Suspense>
      </Canvas>
      <SelectionEditor
        parts={shirtParts}
        selectedPart={selectedPart}
        partMaterials={effectivePartMaterials}
        onPartSelected={(part) => {
          // Set the selected part, or deselect it if it's already selected
          selectionState.selectedPart =
            part === selectionState.selectedPart ? null : part;
        }}
        onPartMaterialChange={(part, material) => {
          if (selectionState.partMaterials) {
            selectionState.partMaterials[part] = material;

            // Save the updated part materials to the backend
            setFileDataAction(fileId, selectionState.partMaterials);
          }
        }}
      />
    </div>
  );
}
