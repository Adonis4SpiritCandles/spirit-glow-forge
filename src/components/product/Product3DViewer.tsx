import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import * as THREE from 'three';

// Candle component with realistic ceramic material
function Candle({ waxColor, showFlame }: { waxColor: string; showFlame: boolean }) {
  const meshRef = useRef<THREE.Group>(null);
  const flameRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
    }
    
    // Animate flame
    if (flameRef.current && showFlame) {
      const time = clock.getElapsedTime();
      flameRef.current.position.y = 0.35 + Math.sin(time * 2) * 0.02;
      flameRef.current.scale.set(1, 1 + Math.sin(time * 3) * 0.1, 1);
    }
    
    // Animate flame light
    if (lightRef.current && showFlame) {
      const time = clock.getElapsedTime();
      lightRef.current.intensity = 2 + Math.sin(time * 4) * 0.3;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Black ceramic container - matte finish */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.60, 0.65, 1.0, 32]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>

      {/* Rounded top edge */}
      <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.60, 0.02, 16, 32]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>

      {/* Wax inside with selectable color */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.56, 0.61, 0.75, 32]} />
        <meshStandardMaterial
          color={waxColor}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Wick - cotton natural beige */}
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.08, 8]} />
        <meshStandardMaterial color="#d4c5a0" />
      </mesh>

      {/* Animated Flame */}
      {showFlame && (
        <>
          <mesh ref={flameRef} position={[0, 0.35, 0]}>
            <coneGeometry args={[0.03, 0.08, 8]} />
            <meshStandardMaterial
              color="#ff9933"
              emissive="#ff6600"
              emissiveIntensity={1}
              transparent
              opacity={0.9}
            />
          </mesh>
          <pointLight
            ref={lightRef}
            position={[0, 0.4, 0]}
            color="#ff9933"
            intensity={2}
            distance={2}
          />
        </>
      )}

      {/* Wooden lid */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.64, 0.64, 0.08, 32]} />
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
  const { language, t } = useLanguage();
  const [waxColor, setWaxColor] = useState('#f8f8f5');
  const [showFlame, setShowFlame] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);

  const waxColors = [
    { name: language === 'pl' ? 'Biały' : 'White', color: '#f8f8f5' },
    { name: language === 'pl' ? 'Avorio/Crema' : 'Ivory/Cream', color: '#f5f0e8' }
  ];

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

      {/* Color Picker */}
      <div className="flex flex-col gap-3 p-4 bg-secondary/20 rounded-lg">
        <Label className="font-semibold">{t('waxColor')}</Label>
        <div className="flex gap-2 flex-wrap">
          {waxColors.map((option) => (
            <Button
              key={option.color}
              variant={waxColor === option.color ? 'default' : 'outline'}
              size="sm"
              onClick={() => setWaxColor(option.color)}
              className="gap-2"
            >
              <div 
                className="w-4 h-4 rounded-full border-2 border-foreground/20"
                style={{ backgroundColor: option.color }}
              />
              {option.name}
            </Button>
          ))}
        </div>
      </div>

      {/* 3D Canvas - Reduced size */}
      <div className="relative w-full max-w-md mx-auto aspect-square max-h-[400px] bg-gradient-to-br from-background to-secondary/20 rounded-lg overflow-hidden border-2 border-primary/20">
        <Canvas
          camera={{ position: [0, 0.5, 3], fov: 45 }}
          shadows
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            {/* Lighting - Warm soft light ~3000K */}
            <ambientLight intensity={0.4} color="#fff5e6" />
            <directionalLight
              position={[5, 5, 5]}
              intensity={0.8}
              color="#fff5e6"
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            <pointLight position={[-5, 5, -5]} intensity={0.4} color="#fff5e6" />
            
            {/* Environment for reflections */}
            <Environment preset="studio" />
            
            {/* The candle model */}
            <Candle waxColor={waxColor} showFlame={showFlame} />
            
            {/* Controls */}
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              minDistance={2}
              maxDistance={5}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 2}
              autoRotate={autoRotate}
              autoRotateSpeed={2}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 p-4 bg-secondary/20 rounded-lg">
        {/* Flame Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="flame-toggle" className="font-semibold">
            {t('flame')}
          </Label>
          <Switch
            id="flame-toggle"
            checked={showFlame}
            onCheckedChange={setShowFlame}
          />
        </div>

        {/* Auto Rotate Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-rotate" className="font-semibold">
            {t('autoRotate')}
          </Label>
          <Switch
            id="auto-rotate"
            checked={autoRotate}
            onCheckedChange={setAutoRotate}
          />
        </div>
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
