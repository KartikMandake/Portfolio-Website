import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GlassShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2() }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      // Fill the screen perfectly by skipping projection
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    varying vec2 vUv;
    
    // Simplex 2D noise algorithm for the core distortion logic
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ; m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
    }
    
    void main() {
      vec2 uv = vUv;
      
      // Moving noise over time mimicking refractive fluid glass 
      vec2 noiseUv = uv * 3.0 + uTime * 0.08;
      float noiseVal = snoise(noiseUv) * 0.5 + 0.5;
      
      // Creating the frosted glass streak effect using elongated UV logic
      float streaks = snoise(vec2(uv.x * 10.0, uv.y * 2.0 - uTime * 0.15));
      
      // Base premium glass color grading
      vec3 tintBase = vec3(0.06, 0.08, 0.12); // Deep premium blue/black
      vec3 reflection = vec3(0.85, 0.70, 0.45); // Shimmering golden specular
      
      // Blend using the noise output to create glossy highlights
      float highlight = smoothstep(0.4, 0.9, noiseVal + streaks * 0.3);
      vec3 finalColor = mix(tintBase, reflection, highlight * 0.25);
      
      // Calculating variable opacity so the DOM grid underneath remains visible
      float alpha = 0.15 + (highlight * 0.4);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
  transparent: true,
  depthWrite: false
};

const BackgroundShader = () => {
  const materialRef = useRef();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh>
      {/* 2x2 Plane fills clip coordinates exactly (-1 to 1) */}
      <planeGeometry args={[2, 2]} />
      <shaderMaterial 
        ref={materialRef}
        attach="material"
        args={[GlassShaderMaterial]}
        transparent={true}
      />
    </mesh>
  );
};

export default function GlassOverlay() {
  const containerRef = useRef();
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Container providing CSS backdrop distortion and rendering the R3F Shader overlay */}
      <div 
        ref={containerRef}
        style={{ 
          position: 'absolute', 
          inset: 0, 
          zIndex: 5, 
          pointerEvents: 'none',
          backdropFilter: 'blur(6px) brightness(0.85) contrast(1.1)', // Core DOM distortion & glass look
          WebkitBackdropFilter: 'blur(6px) brightness(0.85) contrast(1.1)',
        }}
      >
        <Canvas frameloop={isInView ? 'always' : 'never'}>
          <BackgroundShader />
        </Canvas>
      </div>

      {/* Layer specifically adding pure CSS noise & grain for extreme realism */}
      <div 
        style={{ 
          position: 'absolute', 
          inset: 0, 
          zIndex: 6, 
          pointerEvents: 'none',
          backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")',
          opacity: 0.12,
          mixBlendMode: 'overlay', // Blends noise naturally with the webgl reflections
        }} 
      />
    </>
  );
}
