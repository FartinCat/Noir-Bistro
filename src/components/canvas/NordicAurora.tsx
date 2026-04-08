import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';

const NordicAurora: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const scroll = useScroll(); // Back to integrated scroll
  
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uIsMobile: { value: isMobile ? 1.0 : 0.0 },
    uColor1: { value: new THREE.Color('#0A1128') }, // Deep Midnight Blue
    uColor2: { value: new THREE.Color('#1C3B4E') }, // Arctic Teal
    uColor3: { value: new THREE.Color('#8B5A2B') }, // Smoked Amber
    uColor4: { value: new THREE.Color('#E5D3B3') }, // Pale Gold
  }), [isMobile]);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.getElapsedTime();
      
      // Sync seamlessly with Drei's ScrollControls
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
    uniform float uIsMobile;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform vec3 uColor4;
    varying vec2 vUv;

    // Simplex 2D noise
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 a0 = x - floor(x + 0.5);
      float m1 = 1.79284291400159 - 0.85373472095314 * ( a0.x*a0.x + h.x*h.x );
      vec3 g;
      g.x  = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vec2 uv = vUv;
      
      // Luxury Noise Distortion
      float n = snoise(uv * 1.5 + uTime * 0.05);
      
      // Reduce complexity on mobile
      float n2 = 0.0;
      if (uIsMobile < 0.5) {
        n2 = snoise(uv * 2.5 - uTime * 0.08);
      }
      
      // Scroll-Driven Shift
      float distAmount = mix(0.15, 0.05, uScroll);
      vec2 distortedUv = uv + vec2(n, n2) * distAmount;
      
      // Color Blending (Aurora Effect)
      float mix1 = smoothstep(0.0, 0.8, distortedUv.y + n * 0.3);
      vec3 baseColor = mix(uColor1, uColor2, mix1);
      
      float scrollFactor = uScroll * 0.6;
      float mix2 = smoothstep(0.4 - scrollFactor, 1.2 - scrollFactor, distortedUv.y + n2 * 0.2);
      vec3 topColor = mix(uColor3, uColor4, mix2);
      
      float finalMix = smoothstep(0.3, 0.9, distortedUv.y + n * 0.2);
      vec3 color = mix(baseColor, topColor, finalMix);
      
      color *= 0.85;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  return (
    <mesh ref={meshRef} frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
};

export default NordicAurora;
