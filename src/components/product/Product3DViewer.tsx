import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { useLanguage } from '@/contexts/LanguageContext';
import * as THREE from 'three';

// Candle component with realistic materials  
function Candle() {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Glass container - dark smoky glass */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.45, 0.5, 1.2, 32]} />
        <meshPhysicalMaterial
          color="#1a1410"
          transparent
          opacity={0.3}
          roughness={0.1}
          metalness={0.1}
          transmission={0.9}
          thickness={0.5}
          envMapIntensity={1}
        />
      </mesh>

      {/* White wax inside */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.42, 0.47, 0.85, 32]} />
        <meshStandardMaterial
          color="#f8f8f5"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Wick */}
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.15, 8]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* Optional wooden lid */}
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.08, 32]} />
        <meshStandardMaterial
          color="#8B7355"
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>
    </group>
  );
}

const Product3DViewer = () => {
  const { language } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">
          {language === 'pl' ? 'Widok 3D' : '3D View'}
        </h3>
        <p className="text-muted-foreground text-sm">
          {language === 'pl' 
            ? 'Obróć myszką lub przeciągnij palcem' 
            : 'Rotate with mouse or drag with finger'}
        </p>
      </div>

      <div className="relative aspect-square bg-gradient-to-br from-background to-secondary/20 rounded-lg overflow-hidden border-2 border-primary/20">
        <Canvas
          camera={{ position: [0, 0.5, 3], fov: 45 }}
          shadows
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[5, 5, 5]}
              intensity={1}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            <pointLight position={[-5, 5, -5]} intensity={0.5} />
            
            {/* Environment for reflections */}
            <Environment preset="studio" />
            
            {/* The candle model */}
            <Candle />
            
            {/* Controls */}
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              minDistance={2}
              maxDistance={5}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 2}
              autoRotate={false}
              autoRotateSpeed={2}
            />
          </Suspense>
        </Canvas>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        {language === 'pl' 
          ? 'Przybliż, oddal i obróć aby zobaczyć szczegóły' 
          : 'Zoom, pan and rotate to see details'}
      </div>
    </div>
  );
};

export default Product3DViewer;
