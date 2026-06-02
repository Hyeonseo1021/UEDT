// ④ 내 영역 — Building.tsx
// 층(floor) 단위 파사드 패널 방식 — 슬래브+창문 반복으로 사실적인 건물 외관

import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { Building as BuildingData, BuildingState, RiskLevel, ViewMode } from './types'

// 층 단위 상수
const FLOOR_H  = 3.5    // 층 높이
const SLAB_H   = 0.32   // 바닥 슬래브 두께
const GLASS_H  = FLOOR_H - SLAB_H - 0.1  // 창문 밴드 높이

const RISK_HEX: Record<RiskLevel, string> = {
  normal:  '#22c55e',
  warning: '#f59e0b',
  danger:  '#ef4444',
}

// ─── 오피스: 유리 커튼월 고층 타워 ──────────────────────────────────────────
// 층마다 콘크리트 슬래브 + 짙은 파랑 유리창 밴드가 교번 → 수평 스트라이프
function OfficeShape({ h, w, d }: { h: number; w: number; d: number }) {
  const floorCount = Math.max(2, Math.ceil(h / FLOOR_H))

  return (
    <group>
      {/* 코너 구조 기둥 */}
      {([[1,1],[-1,1],[1,-1],[-1,-1]] as [number,number][]).map(([sx,sz], i) => (
        <mesh key={i} position={[sx*(w/2-0.18), 0, sz*(d/2-0.18)]} castShadow>
          <boxGeometry args={[0.3, h+0.1, 0.3]} />
          <meshStandardMaterial color="#d1d5db" roughness={0.65} />
        </mesh>
      ))}

      {/* 층별 슬래브 + 유리창 */}
      {Array.from({ length: floorCount }).map((_, i) => {
        const slabY  = -h/2 + i*FLOOR_H
        const glassY = slabY + SLAB_H + GLASS_H/2
        // 상층부일수록 유리 색 약간 밝게
        const tint = Math.floor(30 + (i/floorCount)*20)
        const glassColor = `rgb(${tint}, ${tint+20}, ${tint+60})`

        return (
          <group key={i}>
            {/* 바닥 슬래브 — 밝은 콘크리트 */}
            <mesh position={[0, slabY + SLAB_H/2, 0]} castShadow>
              <boxGeometry args={[w, SLAB_H, d]} />
              <meshStandardMaterial color="#e5e7eb" roughness={0.7} />
            </mesh>
            {/* 유리창 밴드 — 짙은 블루 */}
            <mesh position={[0, glassY, 0]} castShadow>
              <boxGeometry args={[w, GLASS_H, d]} />
              <meshStandardMaterial color={glassColor} metalness={0.88} roughness={0.05} />
            </mesh>
            {/* 앞면 반사 레이어 */}
            <mesh position={[0, glassY, d/2+0.01]}>
              <planeGeometry args={[w-0.32, GLASS_H-0.06]} />
              <meshStandardMaterial color="#60a5fa" metalness={0.95} roughness={0.02}
                transparent opacity={0.65} />
            </mesh>
            {/* 수직 멀리언 (창문 프레임) */}
            {[-w*0.28, 0, w*0.28].map((mx, mi) => (
              <mesh key={mi} position={[mx, glassY, d/2+0.02]}>
                <boxGeometry args={[0.07, GLASS_H, 0.04]} />
                <meshStandardMaterial color="#c8d4e0" roughness={0.5} />
              </mesh>
            ))}
          </group>
        )
      })}

      {/* 옥상 캡 */}
      <mesh position={[0, h/2+0.2, 0]} castShadow>
        <boxGeometry args={[w+0.06, 0.38, d+0.06]} />
        <meshStandardMaterial color="#374151" roughness={0.6} />
      </mesh>
      {/* 기계실 */}
      <mesh position={[0, h/2+0.6, 0]} castShadow>
        <boxGeometry args={[w*0.5, 0.8, d*0.5]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.6} />
      </mesh>
      {/* 헬리패드 */}
      <mesh position={[0, h/2+1.02, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <circleGeometry args={[0.85, 32]} />
        <meshStandardMaterial color="#6b7280" roughness={0.8} />
      </mesh>
      <mesh position={[0, h/2+1.03, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <ringGeometry args={[0.72, 0.85, 32]} />
        <meshStandardMaterial color="#f9fafb" roughness={0.8} />
      </mesh>
      {/* 안테나 */}
      <mesh position={[0, h/2+1.6, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.1, 8]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

// ─── 주거: 한국형 아파트 — 패널+발코니 ────────────────────────────────────
function ResidentialShape({ h, w, d }: { h: number; w: number; d: number }) {
  const floorCount = Math.max(2, Math.ceil(h / FLOOR_H))
  // 3~5층 단위로 컬러 교체 (연어 → 베이지 → 연회색)
  const bandColors = ['#f97316', '#fb923c', '#fdba74', '#fde8c8', '#e5e7eb']

  return (
    <group>
      {/* 층별 파사드 패널 */}
      {Array.from({ length: floorCount }).map((_, i) => {
        const baseY = -h/2 + i*FLOOR_H
        const bandIdx = Math.floor(i / 3) % bandColors.length
        const panelColor = bandColors[bandIdx]

        return (
          <group key={i}>
            {/* 벽 패널 */}
            <mesh position={[0, baseY + FLOOR_H/2, 0]} castShadow receiveShadow>
              <boxGeometry args={[w, FLOOR_H, d]} />
              <meshStandardMaterial color={panelColor} roughness={0.85} metalness={0.02} />
            </mesh>
            {/* 층간 분리 띠 (흰 수평선) */}
            <mesh position={[0, baseY + FLOOR_H - 0.06, 0]}>
              <boxGeometry args={[w+0.02, 0.12, d+0.02]} />
              <meshStandardMaterial color="#fef9c3" roughness={0.7} />
            </mesh>
            {/* 창문 — 앞면 */}
            {[-w*0.28, 0, w*0.28].map((cx, ci) => (
              <group key={ci} position={[cx, baseY + FLOOR_H*0.5, d/2+0.02]}>
                {/* 창틀 */}
                <mesh>
                  <boxGeometry args={[0.62, 0.72, 0.07]} />
                  <meshStandardMaterial color="#92400e" roughness={0.7} />
                </mesh>
                {/* 유리 */}
                <mesh position={[0, 0, 0.05]}>
                  <planeGeometry args={[0.46, 0.56]} />
                  <meshStandardMaterial color="#fef9c3" roughness={0.2}
                    metalness={0.1} transparent opacity={0.88} />
                </mesh>
              </group>
            ))}
            {/* 발코니 슬래브 */}
            <mesh position={[0, baseY + FLOOR_H - 0.3, d/2+0.42]} castShadow>
              <boxGeometry args={[w*0.88, 0.1, 0.7]} />
              <meshStandardMaterial color="#fed7aa" roughness={0.75} />
            </mesh>
            {/* 발코니 유리 난간 */}
            <mesh position={[0, baseY + FLOOR_H - 0.3 + 0.3, d/2+0.42+0.32]}>
              <boxGeometry args={[w*0.88, 0.6, 0.04]} />
              <meshStandardMaterial color="#bfdbfe" transparent opacity={0.45}
                metalness={0.3} roughness={0.1} />
            </mesh>
          </group>
        )
      })}

      {/* 지붕 처마 */}
      <mesh position={[0, h/2+0.22, 0]} castShadow>
        <boxGeometry args={[w+0.5, 0.4, d+0.5]} />
        <meshStandardMaterial color="#78350f" roughness={0.75} />
      </mesh>
      {/* 옥상 물탱크 */}
      <mesh position={[w*0.22, h/2+0.8, d*0.18]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.82, 12]} />
        <meshStandardMaterial color="#6b7280" roughness={0.85} />
      </mesh>
    </group>
  )
}

// ─── 상업: 현대 유리 플라자 ─────────────────────────────────────────────────
function CommercialShape({ h, w, d }: { h: number; w: number; d: number }) {
  const upperFloors = Math.max(1, Math.ceil((h - FLOOR_H*1.5) / FLOOR_H))

  return (
    <group>
      {/* 1층 — 전면 유리 상가 (높이 1.5배) */}
      <mesh position={[0, -h/2 + FLOOR_H*0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, FLOOR_H*1.5, d]} />
        <meshStandardMaterial color="#e0f2fe" roughness={0.7} />
      </mesh>
      {/* 1층 전면 대형 유리 */}
      <mesh position={[0, -h/2 + FLOOR_H*0.75, d/2+0.02]}>
        <planeGeometry args={[w*0.92, FLOOR_H*1.4]} />
        <meshStandardMaterial color="#7dd3fc" metalness={0.65} roughness={0.06}
          transparent opacity={0.88} />
      </mesh>
      {/* 1층 수직 프레임 */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[-w*0.4 + i*(w*0.2), -h/2 + FLOOR_H*0.75, d/2+0.03]}>
          <boxGeometry args={[0.08, FLOOR_H*1.4, 0.04]} />
          <meshStandardMaterial color="#1e40af" roughness={0.4} />
        </mesh>
      ))}
      {/* 1층 입구 차양 */}
      <mesh position={[0, -h/2 + FLOOR_H*1.5 + 0.1, d/2+1.4]}
        rotation={[-Math.PI/10, 0, 0]} castShadow>
        <boxGeometry args={[w*0.65, 0.1, 2.5]} />
        <meshStandardMaterial color="#1d4ed8" roughness={0.45} />
      </mesh>

      {/* 2층 이상 — 슬래브+유리 밴드 반복 */}
      {Array.from({ length: upperFloors }).map((_, i) => {
        const slabY = -h/2 + FLOOR_H*1.5 + i*FLOOR_H
        const glassY = slabY + SLAB_H + GLASS_H/2
        return (
          <group key={i}>
            <mesh position={[0, slabY + SLAB_H/2, 0]} castShadow>
              <boxGeometry args={[w, SLAB_H, d]} />
              <meshStandardMaterial color="#e0f2fe" roughness={0.7} />
            </mesh>
            <mesh position={[0, glassY, 0]} castShadow>
              <boxGeometry args={[w, GLASS_H, d]} />
              <meshStandardMaterial color="#1e3a8a" metalness={0.85} roughness={0.06} />
            </mesh>
            <mesh position={[0, glassY, d/2+0.01]}>
              <planeGeometry args={[w-0.2, GLASS_H-0.06]} />
              <meshStandardMaterial color="#93c5fd" metalness={0.92} roughness={0.03}
                transparent opacity={0.72} />
            </mesh>
          </group>
        )
      })}

      {/* 옥상 브랜드 띠 */}
      <mesh position={[0, h/2, d/2+0.02]}>
        <planeGeometry args={[w*0.92, 0.85]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.4} />
      </mesh>
      {/* 옥상 AC 유닛 */}
      {[-w*0.22, w*0.18].map((x, i) => (
        <mesh key={i} position={[x, h/2+0.28, 0]} castShadow>
          <boxGeometry args={[0.9, 0.5, 1.1]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.55} />
        </mesh>
      ))}
    </group>
  )
}

// ─── 공공: 신고전주의 관공서 ─────────────────────────────────────────────────
function PublicShape({ h, w, d }: { h: number; w: number; d: number }) {
  const colCount = 6

  return (
    <group>
      {/* 기단 3단 */}
      {[1.8, 1.0, 0.3].map((extra, si) => (
        <mesh key={si} position={[0, -h/2 + si*0.35 + 0.175, 0]} receiveShadow>
          <boxGeometry args={[w+extra, 0.35, d+extra]} />
          <meshStandardMaterial color={['#e7e5e4','#d6d3d1','#f5f0e8'][si]} roughness={0.82} />
        </mesh>
      ))}

      {/* 메인 바디 */}
      <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
        <boxGeometry args={[w*0.88, h*0.82, d*0.88]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.85} />
      </mesh>

      {/* 아치형 창문 (세로로 길게) */}
      {[-w*0.24, 0, w*0.24].map((x, i) => (
        <group key={i} position={[x, 0.4, d*0.88/2+0.02]}>
          <mesh>
            <boxGeometry args={[0.65, h*0.52, 0.07]} />
            <meshStandardMaterial color="#d6d3d1" roughness={0.75} />
          </mesh>
          <mesh position={[0, 0, 0.05]}>
            <planeGeometry args={[0.50, h*0.46]} />
            <meshStandardMaterial color="#bfdbfe" roughness={0.2}
              metalness={0.15} transparent opacity={0.85} />
          </mesh>
        </group>
      ))}

      {/* 황금 수평 장식띠 */}
      <mesh position={[0, h*0.12+0.4, d*0.88/2+0.03]}>
        <planeGeometry args={[w*0.88, 0.22]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.4} metalness={0.25} />
      </mesh>

      {/* 정면 기둥 */}
      {Array.from({ length: colCount }).map((_, i) => {
        const x = -w*0.36 + i*(w*0.72/(colCount-1))
        return (
          <mesh key={i} position={[x, 0.38, d*0.88/2+0.3]} castShadow>
            <cylinderGeometry args={[0.15, 0.19, h*0.82, 14]} />
            <meshStandardMaterial color="#e7e5e4" roughness={0.78} />
          </mesh>
        )
      })}

      {/* 페디먼트(삼각 지붕) */}
      <mesh position={[0, h*0.42+0.4+0.42, d*0.88/2+0.3]} castShadow>
        <cylinderGeometry args={[0.01, w*0.46, h*0.13, 3]} />
        <meshStandardMaterial color="#e7e5e4" roughness={0.8} />
      </mesh>

      {/* 돔 받침 */}
      <mesh position={[0, h*0.42+0.4+0.45, 0]} castShadow>
        <cylinderGeometry args={[w*0.22, w*0.30, 0.6, 20]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.72} />
      </mesh>
      {/* 돔 */}
      <mesh position={[0, h*0.42+0.4+0.95, 0]} castShadow>
        <sphereGeometry args={[w*0.22, 24, 24, 0, Math.PI*2, 0, Math.PI/2]} />
        <meshStandardMaterial color="#d4a847" roughness={0.28} metalness={0.38} />
      </mesh>
    </group>
  )
}

// ─── 메인 Building 래퍼 ─────────────────────────────────────────────────────
interface BuildingProps {
  data: BuildingData
  state?: BuildingState
  selectedId: number | null
  viewMode: ViewMode
  onBuildingClick: (id: number) => void
}

const TYPE_SIZE = {
  office:      { w: 9,  d: 9  },
  residential: { w: 11, d: 10 },
  commercial:  { w: 15, d: 12 },
  public:      { w: 13, d: 13 },
}

const TYPE_ACCENT = {
  office:      '#374151',
  residential: '#92400e',
  commercial:  '#1d4ed8',
  public:      '#78716c',
}

export function Building({ data, state, selectedId, onBuildingClick }: BuildingProps) {
  const groupRef   = useRef<THREE.Group>(null!)
  const overlayRef = useRef<THREE.MeshStandardMaterial>(null!)
  const lightRef   = useRef<THREE.PointLight>(null!)
  const [hovered, setHovered] = useState(false)

  const h          = data.height_factor * FLOOR_H
  const risk: RiskLevel = state?.risk ?? 'normal'
  const { w, d }   = TYPE_SIZE[data.building_type]
  const accent     = TYPE_ACCENT[data.building_type]
  const isSelected = selectedId === data.building_id

  const riskColor = useMemo(() => new THREE.Color(RISK_HEX[risk]), [risk])

  useEffect(() => () => { document.body.style.cursor = 'default' }, [])

  useFrame((st) => {
    if (!groupRef.current) return
    const time = st.clock.elapsedTime

    // hover 부양
    const ty = h/2 + (hovered ? 0.6 : 0)
    groupRef.current.position.y += (ty - groupRef.current.position.y) * 0.1

    // risk 맥박
    let pulse = 0
    if (risk === 'danger')       pulse = 0.55 + Math.sin(time*4)*0.4
    else if (risk === 'warning') pulse = 0.22 + Math.sin(time*2)*0.15
    else if (isSelected || hovered) pulse = 0.05

    if (overlayRef.current) {
      overlayRef.current.emissiveIntensity = pulse
      overlayRef.current.emissive.copy(riskColor)
    }
    if (lightRef.current) {
      const tgt = risk === 'danger'  ? 8 + Math.sin(time*4)*5  :
                  risk === 'warning' ? 2 + Math.sin(time*2)*1.2 : 0
      lightRef.current.intensity += (tgt - lightRef.current.intensity) * 0.1
    }
  })

  const shapeProps = { h, w, d }

  return (
    <group
      ref={groupRef}
      position={[data.city_x, h/2, data.city_z]}
      onClick={(e) => { e.stopPropagation(); onBuildingClick(data.building_id) }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
    >
      {data.building_type === 'office'      && <OfficeShape      {...shapeProps} />}
      {data.building_type === 'residential' && <ResidentialShape {...shapeProps} />}
      {data.building_type === 'commercial'  && <CommercialShape  {...shapeProps} />}
      {data.building_type === 'public'      && <PublicShape      {...shapeProps} />}

      {/* risk 오버레이 */}
      <mesh scale={[1.02, 1.005, 1.02]} visible={risk !== 'normal'}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial ref={overlayRef}
          color={RISK_HEX[risk]} emissive={RISK_HEX[risk]}
          emissiveIntensity={0} transparent
          opacity={risk === 'danger' ? 0.22 : 0.14}
          depthWrite={false} toneMapped={false} />
      </mesh>

      {/* 선택 와이어프레임 */}
      <mesh scale={[1.05, 1.02, 1.05]} visible={isSelected}>
        <boxGeometry args={[w, h, d]} />
        <meshBasicMaterial color={accent} wireframe />
      </mesh>

      <pointLight ref={lightRef} color={RISK_HEX[risk]} intensity={0} distance={20} decay={2} />

      {/* hover 정보 라벨 */}
      {hovered && (
        <Html position={[0, h/2+3, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(15,23,42,0.95)',
            border: `2px solid ${accent}`,
            borderRadius: 10,
            padding: '12px 18px',
            color: '#f8fafc',
            fontFamily: 'ui-monospace, monospace',
            fontSize: 15,
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(12px)',
            minWidth: 210,
            boxShadow: `0 4px 20px rgba(0,0,0,0.5)`,
          }}>
            <div style={{ color: accent, fontWeight: 800, fontSize: 17, marginBottom: 4 }}>
              {data.display_name}
            </div>
            <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 6 }}>
              {data.building_type.toUpperCase()} · ID {data.building_id}
            </div>
            {state && (
              <div style={{ borderTop: '1px solid #334155', paddingTop: 6 }}>
                <div style={{ color: RISK_HEX[risk], fontWeight: 700, fontSize: 15 }}>
                  {risk === 'danger' ? '🚨' : risk === 'warning' ? '⚠️' : '✅'} {risk.toUpperCase()}
                </div>
                <div style={{ color: '#e2e8f0', marginTop: 4, fontSize: 14 }}>
                  <strong>{state.load_kw.toFixed(0)}</strong> kW
                  <span style={{ color: '#64748b', fontSize: 12 }}> / pred {state.predicted_kw.toFixed(0)} kW</span>
                </div>
              </div>
            )}
          </div>
        </Html>
      )}

      {risk !== 'normal' && (
        <Html position={[0, h+2.5, 0]} center style={{ pointerEvents: 'none', userSelect: 'none' }}>
          <div style={{ fontSize: risk === 'danger' ? 24 : 18 }}>
            {risk === 'danger' ? '🚨' : '⚠️'}
          </div>
        </Html>
      )}
    </group>
  )
}
