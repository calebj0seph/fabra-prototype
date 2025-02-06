import { type Mesh } from 'three';

import { ModifiedMaterial } from '../materials/modified-material';

import { useDracoGltf } from './use-draco-gltf';
import type { ModelProps } from './props';

/**
 * The different parts of the shirt model that can have different materials applied to them.
 */
export const shirtParts = [
  // By using spherical coordinates for the camera position of each part, we ensure that the camera
  // is always orbiting around the origin and doesn't end up off-center
  { id: 'back', name: 'Back', camera: { distance: 0.75, phi: 65, theta: 180 } },
  {
    id: 'front',
    name: 'Front',
    camera: { distance: 0.75, phi: 60, theta: 0 },
  },
  {
    id: 'neckRim',
    name: 'Neck Rim',
    camera: { distance: 0.65, phi: 25, theta: 0 },
  },
  {
    id: 'leftSleeve',
    name: 'Left Sleeve',
    camera: { distance: 0.65, phi: 65, theta: 65 },
  },
  {
    id: 'rightSleeve',
    name: 'Right Sleeve',
    camera: { distance: 0.65, phi: 65, theta: -65 },
  },
] as const;

/**
 * Renders a shirt product model.
 *
 * @param props The materials to apply to different parts of the shirt.
 */
export function Shirt(props: ModelProps<(typeof shirtParts)[number]['id']>) {
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
        <ModifiedMaterial base={materials.Back} material={props.back} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.front as Mesh).geometry}
        position={position}
      >
        <ModifiedMaterial base={materials.Front} material={props.front} />
      </mesh>
      <mesh geometry={(nodes.neck_rim as Mesh).geometry} position={position}>
        <ModifiedMaterial
          base={materials.Accessories}
          material={props.neckRim}
        />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.left_sleeve as Mesh).geometry}
        position={position}
      >
        <ModifiedMaterial
          base={materials.Accessories}
          material={props.leftSleeve}
        />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.right_sleeve as Mesh).geometry}
        position={position}
      >
        <ModifiedMaterial
          base={materials.Accessories}
          material={props.rightSleeve}
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
