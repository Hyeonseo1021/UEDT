// TrafficLights.tsx (새 파일)
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

export function TrafficLights() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  
  // 🚥 1. 교차로 모서리 좌표 계산
  const intersections = useMemo(() => {
    const points = []
    // 건물 간격 15 기준, 도로폭이 6.5이므로 오프셋은 약 3.5가 적당함
    for (let i = -105; i <= 105; i += 15) {
      for (let j = -105; j <= 105; j += 15) {
        points.push([i, j])
      }
    }
    return points
  }, [])

  // 인스턴스 개수 계산 (한 교차로당 4개 모서리)
  const instancesCount = intersections.length * 4
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(() => {
    if (!meshRef.current) return

    intersections.forEach((point, idx) => {
      const [x, z] = point
      
      // 교차로 4개 모서리에 배치 오프셋
      const offset = 3.6
      const cornerOffsets = [
        [offset, offset], [-offset, offset], [offset, -offset], [-offset, -offset]
      ]

      cornerOffsets.forEach((coff, cIdx) => {
        const instanceIdx = idx * 4 + cIdx
        dummy.position.set(x + coff[0], 0, z + coff[1])
        
        // 중앙 교차로를 바라보도록 회전
        dummy.rotation.y = Math.atan2(coff[1], coff[0]) + Math.PI / 4 // 대략 중앙을 향함

        dummy.updateMatrix()
        meshRef.current!.setMatrixAt(instanceIdx, dummy.matrix)
      })
    })
    
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  // 🚦 2. 한국식 가로 신호등 형상 정의 (폴 + horizontal box)
  const GeometryGroup = useMemo(() => {
    const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 4) // 폴
    poleGeo.translate(0, 2, 0) // 폴 위치 조정
    
    const headGeo = new THREE.BoxGeometry(0.8, 0.3, 0.2) // 가로 신호등 헤드
    headGeo.translate(0, 4.0, 0) // 헤드 높이 조정 (폴 꼭대기 위)

    return BufferGeometryUtils.mergeGeometries([poleGeo, headGeo])
  }, [])

  return (
    <group>
      {/* 신호등 구조물 (InstancedMesh 적용) */}
      <instancedMesh ref={meshRef} args={[GeometryGroup, undefined, instancesCount]}>
        <meshStandardMaterial color="#222222" metalness={0.5} roughness={0.5} />
      </instancedMesh>
    </group>
  )
}