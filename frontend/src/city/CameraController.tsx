import { useThree, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

type Props = {
  target: THREE.Vector3
  enabled: boolean
  onComplete?: () => void   // 🔥 이동 끝나면 호출
}

export function CameraController({ target, enabled, onComplete }: Props) {
  const { camera } = useThree()

  const currentTarget = useRef(new THREE.Vector3())
  const desiredPosition = useRef(new THREE.Vector3())
  const isMoving = useRef(false)

  useFrame(() => {
    if (!enabled) return

    // 🔥 목표 위치 설정 (처음 1번만)
    if (!isMoving.current) {
      desiredPosition.current.set(
        target.x + 30,
        target.y + 40,
        target.z + 30
      )
      isMoving.current = true
    }

    // 🔥 이동
    camera.position.lerp(desiredPosition.current, 0.08)
    currentTarget.current.lerp(target, 0.08)
    camera.lookAt(currentTarget.current)

    // 🔥 도착 체크
    const dist = camera.position.distanceTo(desiredPosition.current)

    if (dist < 0.5) {
      isMoving.current = false

      // 🔥 여기서 카메라 제어권 넘김
      onComplete?.()
    }
  })

  return null
}