import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Cube3D } from './Cube3D';

/** 3D viewport: a cube you can freely orbit with touch/mouse. */
export function Scene() {
  return (
    <Canvas camera={{ position: [4, 4, 5.5], fov: 38 }} dpr={[1, 2]}>
      <color attach="background" args={['#0f1115']} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[5, 8, 6]} intensity={1.1} />
      <directionalLight position={[-6, -3, -5]} intensity={0.35} />
      <Cube3D />
      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={12}
        rotateSpeed={0.9}
      />
    </Canvas>
  );
}
