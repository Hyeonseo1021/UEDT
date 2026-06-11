import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import type { Building } from './types'

type CityRoadsProps = {
  buildings: Building[]
}

// 🚗 [도구 함수] 단순화된 자동차 형상을 3D 코드로 직접 생성 (성능 최적화용)
function createCarGeometry() {
  const bodyGeo = new THREE.BoxGeometry(2.2, 0.6, 1.2) // 차체
  const cabinGeo = new THREE.BoxGeometry(1.2, 0.5, 1.0) // 지붕
  
  cabinGeo.translate(0, 0.5, 0) // 지붕을 차체 위로 이동
  
  // 두 도형을 합침
  const mergedGeo = BufferGeometryUtils.mergeGeometries([bodyGeo, cabinGeo])
  mergedGeo.computeVertexNormals()
  
  return mergedGeo
}

export function CityRoads({ buildings }: CityRoadsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  
  // 🚗 1. 움직이는 자동차 데이터 생성 (100대)
  const carsCount = 100
  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < carsCount; i++) {
      const isHorizontal = Math.random() > 0.5
      temp.push({
        x: (Math.random() - 0.5) * 210,
        z: (Math.random() - 0.5) * 210,
        speed: (Math.random() * 0.15 + 0.08) * (Math.random() > 0.5 ? 1 : -1),
        isHorizontal,
        offset: (Math.random() - 0.5) * 1.5 // 차선 중앙에서 약간 비껴나게 배치 (현실성)
      })
    }
    return temp
  }, [])

  // 🚗 2. 자동차 Geometry 및 Material 준비
  const carGeometry = useMemo(() => createCarGeometry(), [])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // 🛣️ 3. 한국식 도로 데이터 계산 (건물 간격 15 기준, 도로폭 6으로 확장)
  const gridLines = useMemo(() => {
    const lines = []
    // 중심축 오프셋을 고려하여 도로 생성 범위 확대
    for (let i = -120; i <= 120; i += 15) {
      lines.push(i + 7.5) // 건물 사이 중심
    }
    return lines
  }, [])

  useFrame(() => {
    if (!meshRef.current) return

    particles.forEach((p, i) => {
      // 🚗 4. 자동차 이동 로직 (맵 끝으로 가면 반대편 등장)
      if (p.isHorizontal) {
        p.x += p.speed
        if (p.x > 105) p.x = -105
        if (p.x < -105) p.x = 105
      } else {
        p.z += p.speed
        if (p.z > 105) p.z = -105
        if (p.z < -105) p.z = 105
      }

      // 🛣️ 5. 한국식 2차선 중앙 정렬 및 차선 이동 (offset 활용)
      const isNegativeDirection = p.speed < 0
      // 진행 방향에 따라 2차선(좌/우) 중 한 곳에 배치
      const laneOffset = isNegativeDirection ? -1.8 : 1.8 

      const snappedX = p.isHorizontal ? p.x : Math.round(p.x / 15) * 15 + 7.5 + laneOffset + p.offset
      const snappedZ = p.isHorizontal ? Math.round(p.z / 15) * 15 + 7.5 + laneOffset + p.offset : p.z

      dummy.position.set(snappedX, 0.4, snappedZ)
      
      // 진행 방향에 맞춰 자동차 회전
      dummy.rotation.y = p.isHorizontal ? // 🔥 여기에 물음표(?)를 추가하세요!
        (isNegativeDirection ? 0 : Math.PI) : 
        (isNegativeDirection ? Math.PI / 2 : -Math.PI / 2)
      
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  // 🛣️ 6. 한국 노면 표시 전용 컴포넌트 (횡단보도, 차선)
  const RoadMarkings = ({ isHorizontal, position }) => {
    const args: [number, number] = isHorizontal ? [230, 0.2] : [0.2, 230]
    
    // 점선/실선 처리를 위해 반복 계산 (useMemo 활용하여 성능 최적화)
    const lineInstances = useMemo(() => {
      const instances = []
      const step = isHorizontal ? 220 / 60 : 220 / 60 // 점선 간격

      for (let i = -110; i <= 110; i += step) {
        // 교차로 부근(횡단보도 위치)은 차선을 그리지 않음 (15의 배수 근처)
        if (Math.abs(Math.round(i / 15) * 15 - i) < 2) continue;

        const posX = isHorizontal ? i : 0
        const posZ = isHorizontal ? 0 : i
        const args: [number, number] = isHorizontal ? [step * 0.6, 0.2] : [0.2, step * 0.6] // 점선 길이 비율 조절

        instances.push({ position: [posX, 0.02, 0], args }) // y=0.02 도로 바로 위
      }
      return instances
    }, [isHorizontal])

    // 횡단보도 (zebra markings) 좌표 계산
    const crosswalks = useMemo(() => {
      const points = []
      // 🔥 수정: 건물이 아닌 '가로지르는 도로(교차로)'의 위치(j + 7.5)를 기준으로 계산합니다.
      for (let j = -120; j <= 120; j += 15) {
        const crossRoadPos = j + 7.5 // 교차로의 중심 좌표
        
        // 도로 폭이 6.5이므로, 교차로 중심에서 4.0만큼 떨어진 곳에 횡단보도를 그리면 사거리 가장자리에 딱 맞습니다.
        if (isHorizontal) {
          points.push([crossRoadPos - 4.0, 0, position]) // 교차로 좌측
          points.push([crossRoadPos + 4.0, 0, position]) // 교차로 우측
        } else {
          points.push([position, 0, crossRoadPos - 4.0]) // 교차로 상단
          points.push([position, 0, crossRoadPos + 4.0]) // 교차로 하단
        }
      }
      return points
    }, [isHorizontal, position])

    return (
      <group position={isHorizontal ? [0, 0, position] : [position, 0, 0]}>
        
        {/* 🛣️ 중앙 차선 (흰색 점선/실선) - Simplified rendering */}
        {lineInstances.map((inst, i) => (
          <mesh key={`dash-${i}`} position={inst.position} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={inst.args} />
            <meshBasicMaterial color="white" opacity={0.6} transparent />
          </mesh>
        ))}

        {/* 🛣️ 도로 가장자리 실선 */}
        <mesh position={[isHorizontal ? 0 : 3.0, 0.02, isHorizontal ? -3.0 : 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={args} />
          <meshBasicMaterial color="white" opacity={0.3} transparent />
        </mesh>
        <mesh position={[isHorizontal ? 0 : -3.0, 0.02, isHorizontal ? 3.0 : 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={args} />
          <meshBasicMaterial color="white" opacity={0.3} transparent />
        </mesh>

        {/* 🏁 횡단보도 표시 (Zebra pattern) - Simplified Geometry */}
        {crosswalks.map((cwPos, idx) => {
          // 가로 도로의 횡단보도는 세로 방향 줄무늬, 세로 도로의 횡단보도는 가로 줄무늬여야 함
          const cWArgs: [number, number] = isHorizontal ? [2.5, 0.5] : [0.5, 2.5]
          const stripeGap = 0.8
          
          return (
            <group key={`cw-${idx}`} position={[cwPos[0], 0.02, cwPos[2]]} rotation={[-Math.PI / 2, 0, isHorizontal ? 0 : Math.PI / 2]}>
              {[...Array(6)].map((_, sIdx) => (
                 <mesh key={`s-${sIdx}`} position={[(sIdx - 2.5) * stripeGap, 0, 0]}>
                   <planeGeometry args={[0.3, 3.5]} />
                   <meshBasicMaterial color="white" opacity={0.7} transparent />
                 </mesh>
              ))}
            </group>
          )
        })}
      </group>
    )
  }

  return (
    <group>
      {/* 🛣️ 물리적인 아스팔트 바닥 및 한국식 노면 표시 */}
      {gridLines.map((linePos, idx) => (
        <group key={`road-set-${idx}`}>
          {/* 가로 도로 (Asphalt) */}
          <mesh position={[0, 0.01, linePos]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[230, 6.5]} /> {/* 도로폭 6.5로 확장 */}
            <meshStandardMaterial color="#111111" roughness={0.9} />
          </mesh>
          <RoadMarkings isHorizontal={true} position={linePos} />

          {/* 세로 도로 (Asphalt) */}
          <mesh position={[linePos, 0.01, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
            <planeGeometry args={[230, 6.5]} />
            <meshStandardMaterial color="#111111" roughness={0.9} />
          </mesh>
          <RoadMarkings isHorizontal={false} position={linePos} />
        </group>
      ))}

      {/* 🚗 7. 움직이는 한국 자동차 (InstancedMesh에 로우폴리 자동차 Geometry 적용) */}
      <instancedMesh ref={meshRef} args={[carGeometry, undefined, carsCount]}>
        <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} toneMapped={false} />
      </instancedMesh>
    </group>
  )
}