import { Suspense, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import { Flame, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface Product3DViewerProps {
  productColor?: string;
}

// Candle 3D Model Component
function CandleModel({ color = "#f5e6d3", showFlame }: { color: string; showFlame: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const flameRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (flameRef.current && showFlame) {
      // Flame flicker animation
      const time = clock.getElapsedTime();
      flameRef.current.scale.y = 1 + Math.sin(time * 8) * 0.1;
      flameRef.current.position.y = 2.2 + Math.sin(time * 5) * 0.05;
    }
  });

  return (
    <group>
      {/* Candle body (cylinder) */}
      <mesh ref={meshRef} position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[1, 1, 4, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Wick (thin cylinder) */}
      <mesh position={[0, 2.1, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
        <meshStandardMaterial color="#2d2d2d" />
      </mesh>

      {/* Flame (if lit) */}
      {showFlame && (
        <mesh ref={flameRef} position={[0, 2.2, 0]}>
          <coneGeometry args={[0.15, 0.4, 8]} />
          <meshStandardMaterial
            color="#ff6b35"
            emissive="#ff6b35"
            emissiveIntensity={2}
            transparent
            opacity={0.9}
          />
        </mesh>
      )}

      {/* Flame glow */}
      {showFlame && (
        <pointLight
          position={[0, 2.3, 0]}
          intensity={2}
          distance={5}
          color="#ff8c42"
          castShadow
        />
      )}
    </group>
  );
}

// Loading fallback
function Loader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#cccccc" wireframe />
    </mesh>
  );
}

const Product3DViewer = ({ productColor = "#f5e6d3" }: Product3DViewerProps) => {
  const [candleColor, setCandleColor] = useState(productColor);
  const [showFlame, setShowFlame] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const controlsRef = useRef<any>(null);
  const { language } = useLanguage();

  const colorOptions = [
    { name: "Vanilla Cream", color: "#f5e6d3" },
    { name: "Lavender", color: "#c8b8db" },
    { name: "Ocean Blue", color: "#a8d8ea" },
    { name: "Rose Pink", color: "#f4c2c2" },
    { name: "Forest Green", color: "#9dbfa3" },
    { name: "Midnight Black", color: "#2d2d2d" },
  ];

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const handleZoomIn = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyIn(1.2);
      controlsRef.current.update();
    }
  };

  const handleZoomOut = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyOut(1.2);
      controlsRef.current.update();
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-background/50 to-background rounded-lg overflow-hidden">
      {/* 3D Canvas */}
      <div className="relative w-full h-[500px]">
        <Canvas
          camera={{ position: [0, 2, 6], fov: 50 }}
          shadows
        >
          <Suspense fallback={<Loader />}>
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[5, 5, 5]}
              intensity={1}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            
            <CandleModel color={candleColor} showFlame={showFlame} />
            
            <ContactShadows
              position={[0, -2, 0]}
              opacity={0.4}
              scale={10}
              blur={2}
              far={4}
            />
            
            <Environment preset="sunset" />
            
            <OrbitControls
              ref={controlsRef}
              enablePan={false}
              minDistance={3}
              maxDistance={10}
              autoRotate={autoRotate}
              autoRotateSpeed={2}
            />
          </Suspense>
        </Canvas>

        {/* Controls overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button
            size="icon"
            variant="secondary"
            onClick={handleZoomIn}
            className="bg-card/80 backdrop-blur-sm"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            onClick={handleZoomOut}
            className="bg-card/80 backdrop-blur-sm"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            onClick={handleReset}
            className="bg-card/80 backdrop-blur-sm"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-muted-foreground">
          {language === 'pl' ? 'Przeciągnij aby obrócić • Scroll aby zoom' : 'Drag to rotate • Scroll to zoom'}
        </div>
      </div>

      {/* Color picker */}
      <div className="p-6 border-t border-border/50">
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          {language === 'pl' ? 'Wybierz Kolor Wosku' : 'Choose Wax Color'}
        </h3>
        <div className="flex flex-wrap gap-3 mb-6">
          {colorOptions.map((option) => (
            <motion.button
              key={option.color}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCandleColor(option.color)}
              className={`w-12 h-12 rounded-full border-2 transition-all ${
                candleColor === option.color
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border/50 hover:border-primary/50"
              }`}
              style={{ backgroundColor: option.color }}
              title={option.name}
            />
          ))}
        </div>

        {/* Flame toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-foreground mb-1">
              {language === 'pl' ? 'Podgląd Płomienia' : 'Flame Preview'}
            </h4>
            <p className="text-sm text-muted-foreground">
              {language === 'pl' ? 'Zobacz jak wygląda zapalona świeca' : 'See how the candle looks when lit'}
            </p>
          </div>
          <Button
            variant={showFlame ? "default" : "outline"}
            onClick={() => setShowFlame(!showFlame)}
            className="gap-2"
          >
            <Flame className={`w-4 h-4 ${showFlame ? 'animate-pulse' : ''}`} />
            {showFlame
              ? (language === 'pl' ? 'Zapalona' : 'Lit')
              : (language === 'pl' ? 'Zgaszona' : 'Unlit')}
          </Button>
        </div>

        {/* Auto-rotate toggle */}
        <div className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            id="autoRotate"
            checked={autoRotate}
            onChange={(e) => setAutoRotate(e.target.checked)}
            className="w-4 h-4 text-primary"
          />
          <label htmlFor="autoRotate" className="text-sm text-muted-foreground cursor-pointer">
            {language === 'pl' ? 'Auto-obrót' : 'Auto-rotate'}
          </label>
        </div>
      </div>
    </div>
  );
};

export default Product3DViewer;
