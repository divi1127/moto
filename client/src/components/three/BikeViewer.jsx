import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import BikeModel from './BikeModel';

export default function BikeViewer({ color, finish, stickers, light = 'studio' }) {
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [2.2, 1.6, 3.2], fov: 38 }}>
      <ambientLight intensity={0.45} />
      <directionalLight
        castShadow
        position={[4, 6, 3]}
        intensity={1.2}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-3, 2, -3]} intensity={0.6} color="#ffd9b0" />
      <BikeModel color={color} finish={finish} stickers={stickers} />
      <ContactShadows position={[0, 0, 0]} opacity={0.55} scale={7} blur={2.2} far={3} color="#000000" />
      <Environment preset={light === 'studio' ? 'city' : 'sunset'} />
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={1.8}
        maxDistance={5.5}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2 + 0.15}
      />
    </Canvas>
  );
}
