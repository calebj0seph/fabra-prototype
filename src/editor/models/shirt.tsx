import { type Mesh } from 'three';

import { MaterialWithTextures } from '../materials/material-with-textures';
import { useDracoGltf } from '../utils';

import { partDefinition, type ModelProps } from './types';

/**
 * The different parts of the shirt model that can have different materials applied to them.
 */
export const shirtParts = partDefinition({
  front: {
    id: 'front',
    name: 'Front',
    camera: { distance: 0.75, latitude: 60, longitude: 0 },
    defaultMaterial: 'houndstooth',
  },
  back: {
    id: 'back',
    name: 'Back',
    camera: { distance: 0.75, latitude: 65, longitude: 180 },
    defaultMaterial: 'houndstooth',
  },
  neckRim: {
    id: 'neckRim',
    name: 'Neck Rim',
    camera: { distance: 0.65, latitude: 25, longitude: 0 },
    defaultMaterial: 'houndstooth',
  },
  leftSleeve: {
    id: 'leftSleeve',
    name: 'Left Sleeve',
    camera: { distance: 0.65, latitude: 65, longitude: 65 },
    defaultMaterial: 'houndstooth',
  },
  rightSleeve: {
    id: 'rightSleeve',
    name: 'Right Sleeve',
    camera: { distance: 0.65, latitude: 65, longitude: -65 },
    defaultMaterial: 'houndstooth',
  },
});

/**
 * Renders a shirt product model.
 *
 * @param props The materials to apply to different parts of the shirt.
 */
export function Shirt({ partMaterials }: ModelProps<typeof shirtParts>) {
  const { nodes, materials } = useDracoGltf('/models/shirt/shirt.glb');
  const position = [0, -1.2, 0.065] as const;

  return (
    <group dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.back as Mesh).geometry}
        position={position}
      >
        <MaterialWithTextures
          material={materials.Back}
          textures={partMaterials.back}
        />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.front as Mesh).geometry}
        position={position}
      >
        <MaterialWithTextures
          material={materials.Front}
          textures={partMaterials.front}
        />
      </mesh>
      <mesh geometry={(nodes.neck_rim as Mesh).geometry} position={position}>
        <MaterialWithTextures
          material={materials.Accessories}
          textures={partMaterials.neckRim}
        />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.left_sleeve as Mesh).geometry}
        position={position}
      >
        <MaterialWithTextures
          material={materials.Accessories}
          textures={partMaterials.leftSleeve}
        />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.right_sleeve as Mesh).geometry}
        position={position}
      >
        <MaterialWithTextures
          material={materials.Accessories}
          textures={partMaterials.rightSleeve}
        />
      </mesh>
      <mesh
        receiveShadow
        geometry={(nodes.shirt_interior as Mesh).geometry}
        material={materials.Interior}
        position={position}
      />
    </group>
  );
}
