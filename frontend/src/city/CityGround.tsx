import { Grid } from '@react-three/drei'

export function CityGround() {
  return (
    <group position={[0, -0.1, 0]}>
      {/* 기본 어두운 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#020617" roughness={0.8} />
      </mesh>
      
      {/* 🌟 사이버 네온 그리드 효과 */}
      <Grid
        args={[500, 500]}
        cellSize={15}         // 건물 간격(15)과 맞춤
        cellThickness={0.8}
        cellColor="#1e293b"
        sectionSize={60}      // 4블록마다 큰 선
        sectionThickness={1.5}
        sectionColor="#3b82f6"
        fadeDistance={250}
        fadeStrength={1.5}
      />
    </group>
  )
}