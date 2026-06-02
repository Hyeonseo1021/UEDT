// ④ 내 영역 — CityScene.tsx
// 주간 대로변 시점 — Sky + 강한 태양광 + 대기 안개

import { useEffect, useMemo, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { Building } from './Building'
import { CityGround } from './CityGround'
import { useCityStore } from './useCityStore'
import type { CitySceneProps, BuildingState } from './types'

function SceneContent({
  buildings, selectedId, viewMode, onBuildingClick,
}: Pick<CitySceneProps, 'buildings' | 'selectedId' | 'viewMode' | 'onBuildingClick'>) {
  const buildingStates = useCityStore((s) => s.buildingStates)

  const stateMap = useMemo(
    () => new Map<number, BuildingState>(buildingStates.map((bs) => [bs.building_id, bs])),
    [buildingStates]
  )

  return (
    <>
      {/* 대기 안개 — 원경이 자연스럽게 흐려짐 */}
      <fog attach="fog" args={['#b0c8e0', 80, 350]} />

      {/* 사실적인 낮 하늘 */}
      <Sky
        distance={450000}
        sunPosition={[80, 120, 60]}
        inclination={0.52}
        azimuth={0.25}
        turbidity={6}
        rayleigh={0.8}
      />

      {/* 환경맵 — 유리 반사 */}
      <Environment preset="city" />

      {/* 태양광 */}
      <ambientLight intensity={0.55} color="#f8f4ee" />
      <directionalLight
        position={[80, 120, 60]}
        intensity={2.8}
        color="#fff5e0"
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-far={300}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
      />
      {/* 하늘 반사광 */}
      <hemisphereLight args={['#87ceeb', '#c8a96e', 0.65]} />
      {/* 보조 채광 */}
      <directionalLight position={[-40, 30, -20]} intensity={0.45} color="#c7d2fe" />

      <CityGround />

      {buildings.map((b) => (
        <Building
          key={b.building_id}
          data={b}
          state={stateMap.get(b.building_id)}
          selectedId={selectedId}
          viewMode={viewMode}
          onBuildingClick={onBuildingClick}
        />
      ))}

      <EffectComposer>
        {/* 주간: Bloom은 danger 건물에만 살짝 */}
        <Bloom luminanceThreshold={0.88} luminanceSmoothing={0.6} intensity={0.5} radius={0.35} />
        <Vignette eskil={false} offset={0.12} darkness={0.3} />
      </EffectComposer>

      <OrbitControls
        makeDefault
        minDistance={15}
        maxDistance={200}
        maxPolarAngle={Math.PI / 2.15}
        target={[0, 8, -20]}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  )
}

export function CityScene({ buildings, selectedId, viewMode, onBuildingClick }: CitySceneProps) {
  const fetchState = useCityStore((s) => s.fetchState)
  const timestamp  = useCityStore((s) => s.timestamp)

  // timestamp 변경 시 자동 재호출 (의존성 배열 정확히 명시)
  useEffect(() => {
    fetchState(timestamp)
  }, [fetchState, timestamp])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 35, 80], fov: 65 }}
        shadows
        gl={{ antialias: true, toneMapping: 3 /* ACESFilmic */ }}
      >
        <Suspense fallback={null}>
          <SceneContent
            buildings={buildings}
            selectedId={selectedId}
            viewMode={viewMode}
            onBuildingClick={onBuildingClick}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

export { useCityStore }
