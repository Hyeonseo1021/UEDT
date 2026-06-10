import type {
  AlertItem,
  Building,
  EnergyTimePoint,
  ScenarioControls,
  TimelinePoint,
  ZoneType,
} from '../types/energy'
import { calculateLoadRate, calculateRiskLevel } from './risk'

const zoneDemandWeight: Record<ZoneType, number> = {
  residential: 0.55,
  commercial: 0.75,
  industrial: 1,
}

function getPeakMultiplier(timeIndex: number) {
  // 시간대별 기본 수요 패턴입니다. 실제 서비스에서는 백엔드 예측 모델 결과로 대체할 수 있습니다.
  const hour = timeIndex % 24

  if (hour >= 13 && hour <= 17) {
    return 1.04
  }

  if (hour >= 19 && hour <= 22) {
    return 1.03
  }

  if (hour >= 0 && hour <= 5) {
    return 0.82
  }

  return 1
}

function getScenarioMultiplier(
  building: Pick<Building, 'zone'>,
  point: Pick<EnergyTimePoint, 'timeIndex' | 'temperature' | 'humidity' | 'demandFactor'>,
  scenario: ScenarioControls,
) {
  // 사용자 슬라이더 입력을 예측 소비량에 반영하는 mock 계산식입니다.
  // 기온/습도/특정 구역 수요 증가율/피크 시간대가 predictedConsumption에 영향을 줍니다.
  const temperatureLift = Math.max(0, scenario.temperature - 24) * 0.008
  const humidityLift = Math.max(0, scenario.humidity - 55) * 0.0015
  const targetDemandLift =
    building.zone === scenario.targetZone
      ? (scenario.demandIncrease / 100) * zoneDemandWeight[building.zone]
      : 0
  const weatherBaseline =
    Math.max(0, point.temperature - 24) * 0.003 + Math.max(0, point.humidity - 55) * 0.001

  return (
    point.demandFactor *
    getPeakMultiplier(point.timeIndex) *
    (1 + temperatureLift + humidityLift + targetDemandLift + weatherBaseline)
  )
}

export function simulateBuildingStatus(
  buildings: Building[],
  point: EnergyTimePoint,
  scenario: ScenarioControls,
) {
  // 현재 시간 index 기준으로 모든 건물의 실측/예측 소비량, 부하율, 위험도를 계산합니다.
  return buildings.map((building) => {
    const multiplier = getScenarioMultiplier(building, point, scenario)
    const predictedConsumption = Math.round(building.baseConsumption * multiplier)
    const actualConsumption = Math.round(
      building.baseConsumption * point.demandFactor * getPeakMultiplier(point.timeIndex),
    )
    const loadRate = calculateLoadRate(predictedConsumption, building.threshold)

    return {
      ...building,
      currentConsumption: actualConsumption,
      predictedConsumption,
      loadRate,
      riskLevel: calculateRiskLevel(loadRate),
    }
  })
}

export function buildEnergyTimeline(
  building: Building,
  points: EnergyTimePoint[],
  scenario: ScenarioControls,
): TimelinePoint[] {
  // 선택된 건물의 24시간 차트 데이터를 생성합니다.
  // 백엔드가 건물별 시계열을 내려주면 이 함수 대신 API 응답을 그대로 사용할 수 있습니다.
  return points.map((point) => {
    const multiplier = getScenarioMultiplier(building, point, scenario)
    const predictedConsumption = Math.round(building.baseConsumption * multiplier)
    const actualConsumption = Math.round(
      building.baseConsumption * point.demandFactor * getPeakMultiplier(point.timeIndex),
    )

    return {
      ...point,
      buildingId: building.id,
      actualConsumption,
      predictedConsumption,
      threshold: building.threshold,
      loadRate: calculateLoadRate(predictedConsumption, building.threshold),
    }
  })
}

export function applyLoadBalancing(buildings: Building[], scenario: ScenarioControls) {
  // 부하 분산 시나리오 확장 지점입니다.
  // 현재는 위험/주의 건물의 예측 소비량을 일부 낮춘 값을 별도로 보관합니다.
  return buildings.map((building) => {
    const shouldOptimize =
      building.zone === scenario.targetZone && (building.riskLevel === 'danger' || building.riskLevel === 'caution')
    const optimizedConsumption = shouldOptimize
      ? Math.round((building.predictedConsumption ?? 0) * 0.94)
      : building.predictedConsumption

    return {
      ...building,
      optimizedConsumption,
    }
  })
}

export function buildAlertFeed(buildings: Building[]): AlertItem[] {
  // 위험 또는 주의 상태의 건물만 Alert Feed에 표시합니다.
  return buildings
    .filter((building) => building.riskLevel === 'danger' || building.riskLevel === 'caution')
    .sort((left, right) => (right.loadRate ?? 0) - (left.loadRate ?? 0))
    .map((building) => ({
      id: `${building.id}-${building.riskLevel}`,
      buildingName: building.name,
      zone: building.zone,
      riskLevel: building.riskLevel === 'danger' ? 'danger' : 'caution',
      loadRate: building.loadRate ?? 0,
      message:
        building.riskLevel === 'danger'
          ? `${building.name} overload risk`
          : `${building.name} close to threshold`,
    }))
}
