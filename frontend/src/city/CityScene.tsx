import { useMemo, Suspense, useRef, useEffect } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { Building } from './Building'
import { CityGround } from './CityGround'
import { CityRoads } from './CityRoads'
import { CityDecorations } from './CityDecorations'
import { TrafficLights } from './TrafficLights'
import { useThree } from '@react-three/fiber'
import type { CitySceneProps, BuildingState } from './types'
import * as THREE from 'three'
import { CameraController } from './CameraController'

type Props = CitySceneProps & {
  buildingStates: BuildingState[]
  center: { x: number; z: number }
  currentTimeIndex: number
}

function SceneContent({
  buildings,
  buildingStates,
  selectedId,
  viewMode,
  onBuildingClick,
  center,
  currentTimeIndex
}: Props) {

  const controlsRef = useRef<OrbitControlsImpl>(null)
  
  const stateMap = useMemo(
    () => new Map(buildingStates.map(bs => [bs.building_id, bs])),
    [buildingStates]
  )

  /* 🔥 TO-BE: 실제 좌표 기반 카메라 타겟 계산 */
  let target
  const selectedBuilding = buildings.find(b => b.building_id === selectedId)

  if (selectedBuilding) {
    // 선택된 건물의 좌표로 타겟 지정 (Building.tsx와 동일하게 중심점 오프셋 적용)
    target = new THREE.Vector3(
      selectedBuilding.city_x - center.x, 
      10, 
      selectedBuilding.city_z - center.z
    )
  } else {
    // 선택된 건물이 없을 때는 맵의 중앙으로 설정
    target = new THREE.Vector3(0, 10, 0)
  }

  useEffect(() => {
    // 아무것도 선택되지 않았을 때 (여백 클릭 시) 부드럽게 중앙으로 복귀
    if (selectedId === null && controlsRef.current) {
      // 기존의 카메라 방향(dir) 계산이 아닌, 기준 타겟점(0, 10, 0)으로 lerp 이동
      controlsRef.current.target.lerp(new THREE.Vector3(0, 10, 0), 0.1)
      controlsRef.current.update()
    }
  }, [selectedId])

  const timeRatio = currentTimeIndex / 24
  // 아침 6시 일출, 낮 12시 남중, 저녁 6시 일몰로 각도 계산
  const sunAngle = (timeRatio * Math.PI * 2) - (Math.PI / 2)
  const sunX = Math.cos(sunAngle) * 100
  const sunY = Math.sin(sunAngle) * 100

  return (
    <>
      <fog attach="fog" args={['#020617', 50, 250]} />

      <Sky 
        distance={450000} 
        sunPosition={[sunX, sunY, 60]} 
        turbidity={sunY < 10 ? 10 : 0.5} // 일몰/일출 시 노을 효과 강화
      />
      <Environment preset="city" />

      <ambientLight intensity={sunY > 0 ? 0.55 : 0.1} />
      <directionalLight position={[80, 120, 60]} intensity={2.8} castShadow />

      <CityGround />
      <CityDecorations />
      <CityRoads buildings={buildings} />
      <TrafficLights />

      {buildings.map((b, i) => (
        <Building
          key={b.building_id}
          data={b}
          state={stateMap.get(b.building_id)}
          index={i}
          selectedId={selectedId}
          onBuildingClick={onBuildingClick}
          center={center} // Building 컴포넌트에 중심 좌표 전달
        />
      ))}

      <CameraController 
        target={target} 
        enabled={selectedId !== null}
      />

      <EffectComposer>
        <Bloom intensity={0.5} />
        <Vignette />
      </EffectComposer>

      <OrbitControls
        ref={controlsRef}
        enabled={selectedId === null}
        makeDefault
      />
    </>
  )
}

export function CityScene(props: Props) {
  return (
    <Canvas
      shadows
      camera={{ position: [80, 80, 80], fov: 50 }}
      onPointerMissed={() => props.onBuildingClick(null)}
    >
      <Suspense fallback={null}>
        <SceneContent {...props} />
      </Suspense>
    </Canvas>
  )
}