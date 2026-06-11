import { useState, useRef } from 'react'
import { Html, Edges } from '@react-three/drei' // 🔥 Edges 추가
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Building as BuildingData, BuildingState } from './types'

interface BuildingProps {
  data: BuildingData
  state?: BuildingState
  index: number
  selectedId: number | null
  onBuildingClick: (id: number) => void
  center?: { x: number; z: number }
}

export function Building({
  data,
  state,
  index,
  selectedId,
  onBuildingClick,
  center = { x: 0, z: 0 }
}: BuildingProps) {

  const [hovered, setHovered] = useState(false)
  const meshRef = useRef<THREE.Mesh>(null)

  const x = data.city_x - center.x
  const z = data.city_z - center.z
  const h = 8 + (data.height_factor ?? 1) * 3

  const isSelected = selectedId === data.building_id

  /* 🔥 1. 용도별 건물 형태(너비, 깊이) 다르게 설정 */
  const getGeometryArgs = (): [number, number, number] => {
    const type = data.building_type?.toLowerCase()
    
    if (type === 'industrial') {
      return [8, h * 0.6, 8] // 공장: 넓고 낮은 형태
    } else if (type === 'commercial' || type === 'office') {
      return [4.5, h * 1.2, 4.5] // 상업/오피스: 좁고 높은 타워 형태
    } else {
      return [6, h, 6] // 주거 및 기타: 표준 아파트 형태
    }
  }

  /* 🔥 scale 애니메이션 */
  const scaleRef = useRef(1)

  useFrame(() => {
    const targetScale = isSelected ? 1.25 : hovered ? 1.1 : 1
    scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, targetScale, 0.1)

    if (meshRef.current) {
      meshRef.current.scale.set(scaleRef.current, scaleRef.current, scaleRef.current)
    }
  })

  /* 🔥 2. 디지털 트윈 감성의 색상 및 발광(Emissive) 로직 */
  const getColor = () => {
    if (isSelected) return '#00ffd0'
    
    switch (state?.risk) {
      case 'danger': return '#ef4444'  // 강렬한 빨강
      case 'warning': return '#f59e0b' // 경고성 주황
      case 'normal': return '#3b82f6'  // 안정적인 파랑
      default: return '#334155'        // 데이터 없을 시 어두운 회색
    }
  }

  const baseColor = getColor()

  return (
    <group
      position={[x, h / 2, z]}
      onClick={(e) => {
        e.stopPropagation()
        onBuildingClick(data.building_id)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'default'
      }}
    >
      <mesh ref={meshRef}>
        <boxGeometry args={getGeometryArgs()} />
        
        {/* 🔥 반투명한 유리/홀로그램 질감 적용 */}
        <meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={isSelected || hovered ? 0.8 : (state?.risk !== 'normal' ? 0.6 : 0.2)}
          transparent
          opacity={0.85}
          roughness={0.2}
          metalness={0.8}
        />

        {/* 🔥 사이버펑크/설계도 느낌의 테두리 라인 */}
        <Edges 
          linewidth={hovered || isSelected ? 2.5 : 1.5} 
          threshold={15} 
          color={isSelected ? "white" : "#0f172a"} 
        />
      </mesh>

      {hovered && (
        <Html position={[0, h + 3, 0]} center>
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: `1px solid ${baseColor}`,
              padding: '8px 12px',
              borderRadius: '4px',
              color: 'white',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              boxShadow: `0 0 10px ${baseColor}40`,
              backdropFilter: 'blur(4px)'
            }}
          >
            <div style={{ color: baseColor, fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {data.building_type}
            </div>
            <div style={{ fontWeight: '500', marginBottom: '6px' }}>{data.display_name}</div>
            
            {state && (
              <div style={{ display: 'flex', gap: '12px', fontSize: '11px', opacity: 0.9 }}>
                <div>
                  <div style={{ opacity: 0.6, fontSize: '9px' }}>ACTUAL</div>
                  <div style={{ color: '#00ffd0' }}>{state.load_kw ?? '-'} kW</div>
                </div>
                <div>
                  <div style={{ opacity: 0.6, fontSize: '9px' }}>PREDICTED</div>
                  <div style={{ color: '#a855f7' }}>{state.predicted_kw ?? '-'} kW</div>
                </div>
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  )
}