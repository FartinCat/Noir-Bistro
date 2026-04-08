import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';

const Portal: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const scroll = useScroll(); // Sync with unified scroll engine

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.getElapsedTime();
      material.uniforms.uScroll.value = THREE.MathUtils.lerp(
        material.uniforms.uScroll.value,
        scroll.offset,
        0.05
      );
    }
  });

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform float uScroll;
    uniform vec2 uResolution;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / uResolution.y;
      vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

      vec3 color = vec3(0.0);
      
      for(float i=1.0; i<4.0; i++) {
        vec2 gridUv = p * (15.0 * i);
        vec2 id = floor(gridUv);
        vec2 gv = fract(gridUv) - 0.5;
        
        float h = hash(id);
        
        float speed = (0.2 + h * 0.5);
        float t = uTime * speed + h * 6.28;
        
        // Drifting effect based on restored scroll engine
        gv.y += uScroll * 0.5 * i;
        gv.x += sin(t * 0.5) * 0.1;
        
        float dist = length(gv);
        float size = 0.015 * h;
        float twinkle = sin(t) * 0.5 + 0.5;
        
        vec3 starColor = mix(vec3(0.78, 0.66, 0.43), vec3(1.0, 0.9, 0.7), h);
        
        float m = smoothstep(size, 0.0, dist);
        color += m * starColor * twinkle * (1.0 / i);
      }

      float edgeMask = smoothstep(0.7, 0.3, length(p * 0.6));
      color *= edgeMask;

      gl_FragColor = vec4(color, color.r * 0.5);
    }
  `;

  return (
    <mesh ref={meshRef} frustumCulled={false} renderOrder={1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
};

export default Portal;