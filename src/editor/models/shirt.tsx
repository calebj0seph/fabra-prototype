import { type Mesh } from 'three';

import { ModifiedMaterial } from '../materials/modified-material';

import { useDracoGltf } from './use-draco-gltf';
import type { ModelProps } from './props';

/**
 * Renders a shirt product model.
 *
 * @param props The materials to apply to different parts of the shirt.
 */
export function Shirt(
  props: ModelProps<
    'back' | 'front' | 'neckRim' | 'leftSleeve' | 'rightSleeve'
  >,
) {
  const { nodes, materials } = useDracoGltf('/models/shirt/shirt.glb');
  const position = [0, -1.152, 0.065] as const;

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
