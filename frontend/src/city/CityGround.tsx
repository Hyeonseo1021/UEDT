// ④ 내 영역 — CityGround.tsx
// 주간 리얼 도시 지면: 아스팔트 도로, 횡단보도, 차선 화살표, 가로수, 가로등, 산 배경

import { useMemo } from 'react'
import * as THREE from 'three'

// ─── 가로수 (키 크고 좁은 메타세쿼이아 스타일) ───────────────────────────────
function Tree({ x, z, s = 1 }: { x: number; z: number; s?: number }) {
  return (
    <group position={[x, 0, z]} scale={s}>
      <mesh castShadow position={[0, 3.5, 0]}>
        <cylinderGeometry args={[0.18, 0.24, 7, 8]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.95} />
      </mesh>
      {/* 좁은 원통형 수관 — 포플러/메타세쿼이아 */}
      <mesh castShadow position={[0, 9.5, 0]}>
        <cylinderGeometry args={[1.2, 1.5, 10, 10]} />
        <meshStandardMaterial color="#1a4d2e" roughness={0.92} />
      </mesh>
      <mesh castShadow position={[0, 14.5, 0]}>
        <cylinderGeometry args={[0.7, 1.1, 6, 10]} />
        <meshStandardMaterial color="#166534" roughness={0.92} />
      </mesh>
      <mesh castShadow position={[0, 17.5, 0]}>
        <cylinderGeometry args={[0.2, 0.65, 4, 10]} />
        <meshStandardMaterial color="#15803d" roughness={0.92} />
      </mesh>
    </group>
  )
}

// ─── 가로등 ─────────────────────────────────────────────────────────────────
function StreetLamp({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      {/* 테이퍼 폴대 */}
      <mesh castShadow position={[0, 4.5, 0]}>
        <cylinderGeometry args={[0.05, 0.12, 9, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* 아치형 암 */}
      <mesh position={[0.6, 9.1, 0]} rotation={[0, 0, -Math.PI/8]}>
        <cylinderGeometry args={[0.04, 0.04, 1.4, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* 등기구 */}
      <mesh position={[1.1, 9.3, 0]}>
        <boxGeometry args={[0.6, 0.18, 0.4]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

// ─── 횡단보도 ────────────────────────────────────────────────────────────────
function Crosswalk({ x, z, dir, width = 14 }: { x: number; z: number; dir: 'x'|'z'; width?: number }) {
  const stripes = 8
  const sw = 0.6
  const gap = 0.5
  const total = stripes * sw + (stripes-1) * gap
  return (
    <group position={[x, 0.018, z]}>
      {Array.from({ length: stripes }).map((_, i) => {
        const offset = -total/2 + i*(sw+gap) + sw/2
        return (
          <mesh key={i}
            position={dir === 'x' ? [offset, 0, 0] : [0, 0, offset]}
            rotation={[-Math.PI/2, 0, 0]}>
            <planeGeometry args={dir === 'x' ? [sw, width] : [width, sw]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.85} />
          </mesh>
        )
      })}
    </group>
  )
}

// ─── 직진 화살표 ─────────────────────────────────────────────────────────────
function StraightArrow({ x, z, rot = 0 }: { x: number; z: number; rot?: number }) {
  return (
    <group position={[x, 0.019, z]} rotation={[0, rot, 0]}>
      {/* 몸통 */}
      <mesh rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[0.55, 2.5]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.85} />
      </mesh>
      {/* 화살촉 */}
      <mesh position={[0, 0, -1.6]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[1.1, 1.1]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.85} />
      </mesh>
    </group>
  )
}

// ─── 원거리 산 실루엣 ────────────────────────────────────────────────────────
function Mountains() {
  const peaks = useMemo(() => [
    { x: -80,  z: -260, r: 28, h: 70, c: '#3d6b4f' },
    { x:  20,  z: -280, r: 38, h: 90, c: '#4a7c59' },
    { x: 120,  z: -260, r: 32, h: 75, c: '#3d6b4f' },
    { x: -30,  z: -250, r: 22, h: 55, c: '#5a8c6a' },
    { x:  80,  z: -270, r: 26, h: 65, c: '#4a7c59' },
  ], [])

  return (
    <group>
      {peaks.map((p, i) => (
        <mesh key={i} position={[p.x, p.h/2, p.z]} castShadow>
          <coneGeometry args={[p.r, p.h, 12]} />
          <meshStandardMaterial color={p.c} roughness={0.92} />
        </mesh>
      ))}
    </group>
  )
}

export function CityGround() {
  // 메인 대로: x=-7 ~ x=7, z축으로 뻗음
  // 측면 도로: x=-26, x=26 (수직)
  // 횡단 도로: z=16, z=-16, z=-48 (수평)

  return (
    <group>
      {/* ── 기반 지면 (건물이 z=-84까지 있으므로 넓게) ── */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0, -35]} receiveShadow>
        <planeGeometry args={[260, 260]} />
        <meshStandardMaterial color="#c8b07a" roughness={0.92} />
      </mesh>

      {/* ── 잔디 중앙분리대 ── */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.01, -30]}>
        <planeGeometry args={[4, 130]} />
        <meshStandardMaterial color="#4d7c3a" roughness={0.9} />
      </mesh>

      {/* ── 메인 대로 좌측 차도 ── */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[-8.5, 0.01, -30]}>
        <planeGeometry args={[10, 130]} />
        <meshStandardMaterial color="#374151" roughness={0.9} />
      </mesh>
      {/* ── 메인 대로 우측 차도 ── */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[8.5, 0.01, -30]}>
        <planeGeometry args={[10, 130]} />
        <meshStandardMaterial color="#374151" roughness={0.9} />
      </mesh>

      {/* ── 좌측 인도 (나무 x=-16이 여기에 들어감) ── */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[-15.5, 0.01, -30]}>
        <planeGeometry args={[7, 130]} />
        <meshStandardMaterial color="#c8b7a6" roughness={0.88} />
      </mesh>
      {/* ── 우측 인도 ── */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[15.5, 0.01, -30]}>
        <planeGeometry args={[7, 130]} />
        <meshStandardMaterial color="#c8b7a6" roughness={0.88} />
      </mesh>

      {/* ── 측면 도로 (x=±35, 건물 x=±26과 x=±44 사이) ── */}
      {[-35, 35].map((x, i) => (
        <mesh key={i} rotation={[-Math.PI/2, 0, 0]} position={[x, 0.01, -30]}>
          <planeGeometry args={[12, 130]} />
          <meshStandardMaterial color="#374151" roughness={0.9} />
        </mesh>
      ))}

      {/* ── 횡단 도로 (z=15, z=-15, z=-45) ── */}
      {[15, -15, -45].map((z, i) => (
        <mesh key={i} rotation={[-Math.PI/2, 0, 0]} position={[0, 0.015, z]}>
          <planeGeometry args={[100, 10]} />
          <meshStandardMaterial color="#374151" roughness={0.9} />
        </mesh>
      ))}

      {/* ── 이중 황색 중앙선 (메인 대로) ── */}
      {[-0.35, 0.35].map((offset, i) => (
        <mesh key={i} rotation={[-Math.PI/2, 0, 0]} position={[offset, 0.022, -25]}>
          <planeGeometry args={[0.18, 100]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.85} />
        </mesh>
      ))}

      {/* ── 흰 차선 점선 (좌측 차도) ── */}
      {Array.from({ length: 14 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI/2, 0, 0]} position={[-6, 0.022, 12 - i*7]}>
          <planeGeometry args={[0.15, 3.5]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.85} />
        </mesh>
      ))}
      {/* ── 흰 차선 점선 (우측 차도) ── */}
      {Array.from({ length: 14 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI/2, 0, 0]} position={[6, 0.022, 12 - i*7]}>
          <planeGeometry args={[0.15, 3.5]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.85} />
        </mesh>
      ))}

      {/* ── 횡단보도 ── */}
      <Crosswalk x={-8.5} z={14}  dir="z" width={10} />
      <Crosswalk x={ 8.5} z={14}  dir="z" width={10} />
      <Crosswalk x={-8.5} z={-16} dir="z" width={10} />
      <Crosswalk x={ 8.5} z={-16} dir="z" width={10} />
      <Crosswalk x={0}    z={ 10} dir="x" width={14} />
      <Crosswalk x={0}    z={-20} dir="x" width={14} />

      {/* ── 직진 화살표 ── */}
      <StraightArrow x={-8.5} z={  5} rot={Math.PI} />
      <StraightArrow x={-8.5} z={-10} rot={Math.PI} />
      <StraightArrow x={-8.5} z={-28} rot={Math.PI} />
      <StraightArrow x={ 8.5} z={  5} />
      <StraightArrow x={ 8.5} z={-10} />
      <StraightArrow x={ 8.5} z={-28} />

      {/* ── 정지선 ── */}
      {[12, -17].map((z, i) => (
        <group key={i}>
          <mesh rotation={[-Math.PI/2, 0, 0]} position={[-8.5, 0.022, z]}>
            <planeGeometry args={[10, 0.45]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.85} />
          </mesh>
          <mesh rotation={[-Math.PI/2, 0, 0]} position={[8.5, 0.022, z]}>
            <planeGeometry args={[10, 0.45]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.85} />
          </mesh>
        </group>
      ))}

      {/* ── 가로수 열식 배치 (인도 x=±15.5 안쪽) ── */}
      {Array.from({ length: 8 }).map((_, i) => (
        <group key={i}>
          <Tree x={-16} z={ 14 - i*9} s={0.85 + Math.random()*0.15} />
          <Tree x={ 16} z={ 14 - i*9} s={0.85 + Math.random()*0.15} />
          {/* 중앙분리대 가로수 */}
          <Tree x={0}   z={  8 - i*9} s={0.65} />
        </group>
      ))}

      {/* ── 가로등 (인도 바깥쪽) ── */}
      {Array.from({ length: 7 }).map((_, i) => (
        <group key={i}>
          <StreetLamp x={-16.5} z={ 10 - i*11} />
          <StreetLamp x={ 16.5} z={ 10 - i*11} />
        </group>
      ))}

      {/* ── 원거리 산 실루엣 ── */}
      <Mountains />
    </group>
  )
}
