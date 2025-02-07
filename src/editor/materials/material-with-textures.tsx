import type { Material } from 'three';
import { MeshStandardMaterial, TextureLoader } from 'three';

import { Suspense, useEffect } from 'react';

import { useLoader } from '@react-three/fiber';

import type { EditorMaterial } from './materials';
import { getMaterialTextures } from './materials';
import { useClonedMaterial } from './use-cloned-material';

export interface MaterialWithTexturesProps {
  /**
   * The material to use as the base which will have textures applied to it.
   */
  material: Material;
  /**
   * The name of the editor material whose textures should be applied to the base material.
   */
  textures: EditorMaterial;
}

/**
 * Renders a material with a set of custom textures applied to it.
 *
 * @remarks This clones the given material, so it is safe to render multiple instances of this
 * component with the same material and different textures.
 */
export function MaterialWithTextures({
  material,
  textures,
}: MaterialWithTexturesProps) {
  return (
    // Place a suspense here so that we can render a fallback material while loading
    <Suspense fallback={<LoadingMaterial />}>
      <LoadAndApplyTextures material={material} textures={textures} />
    </Suspense>
  );
}

/**
 * Used by {@link MaterialWithTextures} to actually load and apply the textures to the material.
 */
function LoadAndApplyTextures({
  material,
  textures,
}: MaterialWithTexturesProps) {
  const textureUrls = getMaterialTextures(textures);

  // `useLoader` caches the loaded textures by URL, so we don't need to worry about loading the same
  // texture multiple times.
  const [albedo, normal, metallic, ao, roughness] = useLoader(TextureLoader, [
    textureUrls.albedo,
    textureUrls.normal,
    textureUrls.metallic,
    textureUrls.ao,
    ...(textureUrls.roughness ? [textureUrls.roughness] : []),
  ]);

  // Clone the input material. This allows us to modify the material without affecting the original,
  // allowing the original material to be reused many times.
  const clonedMaterial = useClonedMaterial(material, (clonedMaterial) => {
    // We have an AO map for both the mesh and the material, but Three.js only supports one AO map.
    // To work around this, we can modify the material's shader to multiply both AO maps together.
    clonedMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.aoMapSecondary = {
        // This is set in `ModifiedMaterialTextures`
        value: clonedMaterial.userData?.aoMapSecondary,
      };
      shader.uniforms.aoMapSecondaryIntensity = {
        // Don't use the secondary AO map if it's not set
        value: clonedMaterial.userData?.aoMapSecondary ? 1 : 0,
      };
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <aomap_pars_fragment>',
          `
          #include <aomap_pars_fragment>
          uniform float aoMapSecondaryIntensity;
          uniform sampler2D aoMapSecondary;
          `,
        )
        .replace(
          '#include <aomap_fragment>',
          `
          float ambientOcclusionBase = (
            texture2D(aoMap, vAoMapUv).r - 1.0
          ) * aoMapIntensity + 1.0;
          float ambientOcclusionSecondary = (
            texture2D(aoMapSecondary, vAoMapUv).r - 1.0
          ) * aoMapSecondaryIntensity + 1.0;
          float ambientOcclusion = ambientOcclusionBase * ambientOcclusionSecondary;

          // The below is copied from the default shader
          // https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderChunk/aomap_fragment.glsl.js
          reflectedLight.indirectDiffuse *= ambientOcclusion;

          #if defined( USE_CLEARCOAT ) 
            clearcoatSpecularIndirect *= ambientOcclusion;
          #endif

          #if defined( USE_SHEEN ) 
            sheenSpecularIndirect *= ambientOcclusion;
          #endif

          #if defined( USE_ENVMAP ) && defined( STANDARD )
            float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );

            reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
          #endif
          `,
        );
    };

    // Ensure that we recompile the shader now that we've added an onBeforeCompile handler
    clonedMaterial.needsUpdate = true;
  });

  // Ideally we would use the `attach` prop to attach the textures to the material, but this doesn't
  // work here since the textures are raw Three.js objects and not JSX elements. We can't use the
  // <primitive> element either since the texture objects returned by `useLoader` are cached and
  // reused, which the <primitive> element doesn't support.
  useEffect(() => {
    if (clonedMaterial instanceof MeshStandardMaterial) {
      clonedMaterial.map = albedo;
      clonedMaterial.normalMap = normal;
      clonedMaterial.metalnessMap = metallic;
      clonedMaterial.roughnessMap = roughness;

      // Since we use a secondary occlusion map with a shader modification above, we need to put the
      // texture in the `userData` of the material so that we can access it from the
      // `onBeforeCompile` event handler.
      clonedMaterial.userData.aoMapSecondary = ao;
      clonedMaterial.needsUpdate = true;
    }

    return () => {
      if (clonedMaterial instanceof MeshStandardMaterial) {
        clonedMaterial.map = null;
        clonedMaterial.normalMap = null;
        clonedMaterial.metalnessMap = null;
        clonedMaterial.roughnessMap = null;

        clonedMaterial.userData.aoMapSecondary = null;
        clonedMaterial.needsUpdate = true;
      }
    };
  }, [clonedMaterial, albedo, ao, metallic, normal, roughness]);

  return <primitive object={clonedMaterial} />;
}

/**
 * A fallback material to use while loading the textures for a material.
 */
function LoadingMaterial() {
  return (
    <meshStandardMaterial
      transparent
      opacity={0.75}
      roughness={0.5}
      metalness={0.5}
      color="white"
    />
  );
}
