import type { Material, Texture } from 'three';
import { TextureLoader } from 'three';

import { Suspense, useEffect, useRef } from 'react';

import { useLoader } from '@react-three/fiber';

import type { EditorMaterial } from './materials';
import { getMaterialTextures } from './materials';

export interface ModifiedMaterialProps {
  /**
   * The material to use as a base when creating the new modified material.
   */
  base: Material;
  /**
   * The name of the editor material whose textures should be applied to the base material.
   */
  material: EditorMaterial;
}

/**
 * Renders a material with a set of custom textures applied to it.
 */
export function ModifiedMaterial({ base, material }: ModifiedMaterialProps) {
  const modifiedMaterialRef = useRef<Material>();
  const previousBaseRef = useRef<Material>();

  // Clone the base material if `base` changes
  if (previousBaseRef.current !== base) {
    // Clean up the previous cloned material (if any
    if (modifiedMaterialRef.current) {
      modifiedMaterialRef.current.dispose();
    }

    previousBaseRef.current = base;
    modifiedMaterialRef.current = base.clone();

    // We have an AO map for both the mesh and the material, but Three.js only supports one AO map.
    // To work around this, we can modify the material's shader to multiply both AO maps together.
    modifiedMaterialRef.current.onBeforeCompile = (shader) => {
      shader.uniforms.aoMapSecondary = {
        // This is set in `ModifiedMaterialTextures`
        value: modifiedMaterialRef.current?.userData?.aoMapSecondary,
      };
      shader.uniforms.aoMapSecondaryIntensity = {
        // Don't use the secondary AO map if it's not set
        value: modifiedMaterialRef.current?.userData?.aoMapSecondary ? 1 : 0,
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
          float ambientOcclusion = mix(
            1.0,
            texture2D(aoMap, vAoMapUv).r * mix(1.0, texture2D(aoMapSecondary, vAoMapUv).r, aoMapSecondaryIntensity),
            aoMapIntensity
          );

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
    modifiedMaterialRef.current.needsUpdate = true;
  }

  // Clean up the cloned material on unmount
  useEffect(() => {
    return () => {
      if (modifiedMaterialRef.current) {
        modifiedMaterialRef.current.dispose();
      }
    };
  }, []);

  return (
    <primitive object={modifiedMaterialRef.current as Material}>
      {/* Place a suspense here so that we still render the material while textures are loading */}
      <Suspense fallback={null}>
        <ModifiedMaterialTextures material={material} />
      </Suspense>
    </primitive>
  );
}

/**
 * Loads and renders the textures for a given editor material.
 */
function ModifiedMaterialTextures({ material }: { material: EditorMaterial }) {
  const textureUrls = getMaterialTextures(material);

  // `useLoader` caches the loaded textures by URL, so we don't need to worry about loading the same
  // texture multiple times.
  const [albedo, nomral, metallic, ao, roughness] = useLoader(TextureLoader, [
    textureUrls.albedo,
    textureUrls.normal,
    textureUrls.metallic,
    textureUrls.ao,
    ...(textureUrls.roughness ? [textureUrls.roughness] : []),
  ]);

  return (
    <>
      <primitive object={albedo} attach="map" />
      <primitive object={nomral} attach="normalMap" />
      <primitive object={metallic} attach="metalnessMap" />
      {roughness && <primitive object={roughness} attach="roughnessMap" />}
      <primitive
        object={ao}
        attach={(parent: Material, self: Texture) => {
          // We use a secondary occlusion map with a shader modification in `ModifiedMaterial`. We
          // put the texture in the `userData` of the material so that we can access it from the
          // `onBeforeCompile` event handler.
          parent.userData.aoMapSecondary = self;
          parent.needsUpdate = true;

          return () => {
            parent.userData.aoMapSecondary = null;
            parent.needsUpdate = true;
          };
        }}
      />
    </>
  );
}
