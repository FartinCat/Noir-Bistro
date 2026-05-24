import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';

const Portal: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  // Get the global scroll offset (0 to 1)
  const scroll = useScroll();

  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_scroll: { value: 0 }, // Maps to the user's scroll position
    u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
  }), []);

  // Update time and scroll position on every frame
  useFrame((state) => {
    if (meshRef.current) {
      uniforms.u_time.value = state.clock.getElapsedTime();
      // Smoothly update scroll to avoid jarring color jumps
      uniforms.u_scroll.value = THREE.MathUtils.lerp(uniforms.u_scroll.value, scroll.offset, 0.05);
    }
  });

  // Update resolution on window resize
  React.useEffect(() => {
    const handleResize = () => {
      uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [uniforms]);

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      // Passthrough: render as fullscreen background quad
      gl_Position = vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    precision highp float;
    uniform float u_time;
    uniform float u_scroll;
    uniform vec2 u_resolution;
    varying vec2 vUv;

    // ----------------------------------------
    // NOISE FUNCTIONS (Simplex Noise for Aurora)
    // ----------------------------------------
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 = v -   i + dot(i, C.xxx);

      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );

      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;

      i = mod289(i);
      vec4 p = permute( permute( permute( 
                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
              + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

      float n_ = 0.142857142857;
      vec3  ns = n_ * D.wyz - D.xzx;

      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  // mod(p,7*7)

      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);    // mod(j,N)

      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);

      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );

      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));

      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);

      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;

      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }

    float fbm(vec3 p) {
      float sum = snoise(p);
      sum += snoise(p * 2.0 + 1.0) * 0.5;
      sum += snoise(p * 4.0 + 2.0) * 0.25;
      return sum * 0.5 + 0.5;
    }

    void main() {
      // Aspect ratio correction so the aurora stretches across the screen
      vec2 uv = vUv;
      float aspect = u_resolution.x / u_resolution.y;
      vec2 p = vec2(uv.x * aspect, uv.y);
      
      // Time variables for animation
      float t1 = u_time * 0.1;
      float t2 = u_time * 0.15;
      
      // Create two layers of noise for aurora ribbons
      // Layer 1: Broad, sweeping curves
      float n1 = fbm(vec3(p.x * 1.5 + t1, p.y * 2.0, 1.0));
      // Layer 2: Finer details
      float n2 = fbm(vec3(p.x * 3.0 - t2, p.y * 3.0 + 1.0, 2.0));
      
      // Combine layers to create ribbon shapes
      float aurora = (n1 * 0.7 + n2 * 0.3);
      // Enhance contrast to make ribbons distinct
      aurora = smoothstep(0.3, 0.8, aurora);
      
      // Vertical gradient (darker at top, lighter at bottom)
      float grad = 1.0 - uv.y * 0.8;
      
      // Scroll influence: as scroll increases (0 -> 1), warm colors rise from bottom
      float warmMask = smoothstep(0.2, 0.9, uv.y + u_scroll * 0.3);
      
      // ----------------------------------------
      // COLOR PALETTE (Nordic Bistro)
      // ----------------------------------------
      // Deep Midnight Blue
      vec3 colorDeep = vec3(0.02, 0.04, 0.09);
      // Arctic Teal
      vec3 colorTeal = vec3(0.04, 0.08, 0.16);
      // Smoked Amber (Disabled - Dark Blue)
      vec3 colorAmber = vec3(0.01, 0.02, 0.05);
      // Pale Gold (Disabled - Dark Blue)
      vec3 colorGold = vec3(0.02, 0.04, 0.09);
      
      // Base background: mix deep blue and teal based on vertical position
      vec3 bg = mix(colorDeep, colorTeal, grad * 0.7);
      
      // Add aurora glow: the ribbons are a mix of teal and pale gold
      vec3 auroraColor = mix(colorTeal, colorGold, aurora * 0.8);
      vec3 color = mix(bg, auroraColor, aurora * 0.6);
      
      // Apply scroll-driven warming: Disabled
      float warmth = 0.0;
      color = mix(color, colorAmber, warmth * 0.5);
      color = mix(color, colorGold, warmth * 0.8);
      
      // Add subtle ice particles (replaces stardust)
      vec2 grainUv = uv * 200.0;
      float grain = fract(sin(dot(grainUv, vec2(12.9898, 78.233))) * 43758.5453);
      float iceSparkle = step(0.995, grain) * (0.5 + 0.5 * sin(u_time * 2.0));
      // Only show sparkles in aurora regions
      color += vec3(0.8, 0.9, 1.0) * iceSparkle * aurora * 0.3;
      
      // Slight vignette for focus
      float vignette = 1.0 - length(vUv - 0.5) * 0.5;
      color *= vignette;
      
      gl_FragColor = vec4(color, 0.3);
    }
  `;

  return (
    <mesh ref={meshRef} position={[0, 0, -2]} frustumCulled={false} renderOrder={-2}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
};

export default Portal;