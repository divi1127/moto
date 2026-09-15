
import { useMemo } from 'react';
import { STICKER_ZONES } from './stickerZones';
import { FINISH_PRESETS } from './materialPresets';

function BikeBody({ color, finish }) {
  const mat = useMemo(() => ({
    roughness: FINISH_PRESETS[finish]?.roughness ?? 0.12,
    metalness: FINISH_PRESETS[finish]?.metalness ?? 0.2,
    clearcoat: FINISH_PRESETS[finish]?.clearcoat ?? 1.0,
  }), [finish]);

  return (
    <group>
      {/* frame backbone */}
      <mesh castShadow position={[0, 0.45, -0.35]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1.3, 10]} />
        <meshStandardMaterial color=#111 roughness={0.6} metalness={0.8} />
      </mesh>
      {/* fuel tank */}
      <mesh castShadow position={[-0.02, 0.5, 0.35]} rotation={[0, 0, -0.35]}>
        <capsuleGeometry args={[0.17, 0.5, 6, 16]} />
        <meshStandardMaterial color={color} roughness={mat.roughness} metalness={mat.metalness} />
      </mesh>
      {/* seat */}
      <mesh castShadow position={[0, 0.58, -0.25]} rotation={[0, 0, 0.15]}>
        <boxGeometry args={[0.24, 0.07, 0.4]} />
        <meshStandardMaterial color=#222 roughness={0.9} />
      </mesh>
      {/* front mudguard */}
      <mesh castShadow position={[0, 0.32, 0.68]} rotation={[-0.1, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.26, 0.5, 16, 1, true, 0.1, Math.PI - 0.6]} />
        <meshStandardMaterial color={color} roughness={mat.roughness} metalness={mat.metalness} />
      </mesh>
      {/* rear mudguard */}
      <mesh castShadow position={[0, 0.55, -0.95]} rotation={[0.25, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.6, 16, 1, true, 0.2, Math.PI - 0.8]} />
        <meshStandardMaterial color={color} roughness={mat.roughness} metalness={mat.metalness} />
      </mesh>
      {/* wheels */}
      {[0, 1].map(i => (
        <group key={i} position={[0, 0.38, i === 0 ? 0.7 : -0.95]}>
          <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.33, 0.045, 12, 24]} />
            <meshStandardMaterial color=#1a1a2e roughness={0.5} metalness={0.6} />
          </mesh>
          <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.07, 0.07, 0.06, 12]} />
            <meshStandardMaterial color=#777 roughness={0.3} metalness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function BikeModel({ color = '#cc0000', finish = 'Gloss', stickers = [] }) {
  void stickers;
  return (
    <group>
      <BikeBody color={color} finish={finish} />
    </group>
  );
}
