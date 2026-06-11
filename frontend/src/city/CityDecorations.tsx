import { useMemo } from 'react'

export function CityDecorations() {
  const trees = useMemo(() => {
    const treePositions = []
    for (let i = 0; i < 40; i++) {
      treePositions.push({
        x: (Math.random() - 0.5) * 200,
        z: (Math.random() - 0.5) * 200,
        scale: 0.6 + Math.random() * 0.4, // 나무 크기를 살짝 다양하게
        rotationY: Math.random() * Math.PI // 나무가 바라보는 방향도 랜덤하게
      })
    }
    return treePositions
  }, [])

  return (
    <group>
      {trees.map((pos, idx) => (
        <group 
          key={idx} 
          position={[pos.x, 0, pos.z]} 
          scale={pos.scale}
          rotation={[0, pos.rotationY, 0]}
        >
          {/* 🪵 나무 기둥 */}
          <mesh position={[0, 0.75, 0]}>
            <cylinderGeometry args={[0.15, 0.25, 1.5]} />
            <meshStandardMaterial color="#475569" roughness={0.9} />
          </mesh>
          
          {/* 🍃 풍성한 로우폴리 나뭇잎 (정이십면체 활용) */}
          <mesh position={[0, 2.2, 0]}>
            {/* args: [반지름, 디테일수(0이면 각진 폴리곤, 높일수록 둥글어짐)] */}
            <icosahedronGeometry args={[1.2, 0]} />
            <meshStandardMaterial 
              color="#10b981" 
              transparent 
              opacity={0.8} 
              flatShading={true} // 🔥 빛을 받았을 때 각진 면이 뚜렷하게 보이도록 설정
              roughness={0.7}
            />
          </mesh>

          {/* 🍃 작은 나뭇잎 덩어리 추가 (디테일 업그레이드) */}
          <mesh position={[0.6, 1.8, 0.4]}>
            <icosahedronGeometry args={[0.6, 0]} />
            <meshStandardMaterial 
              color="#059669" 
              transparent 
              opacity={0.9} 
              flatShading={true} 
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}