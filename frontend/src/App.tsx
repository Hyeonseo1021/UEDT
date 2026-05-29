import { useEffect, useMemo, useState } from 'react'
import './styles/dashboard.css'
import buildingsData from './data/mockBuildings.json'
import energyData from './data/mockEnergyData.json'
import { DashboardLayout } from './components/DashboardLayout'
import type { Building, EnergyTimePoint, ScenarioControls } from './types/energy'
import {
  applyLoadBalancing,
  buildEnergyTimeline,
  simulateBuildingStatus,
} from './utils/energySimulation'

const buildings = buildingsData as Building[]
const baselineEnergy = energyData as EnergyTimePoint[]

function App() {
  // 화면 전체에서 공유상태입니다
  // 여기서 API 응답이나 3D 이벤트를 연결하면 됩니다,,
  const [selectedBuildingId, setSelectedBuildingId] = useState(buildings[0]?.id ?? '')
  const [currentTimeIndex, setCurrentTimeIndex] = useState(14)
  const [scenario, setScenario] = useState<ScenarioControls>({
    temperature: 30,
    humidity: 65,
    demandIncrease: 25,
  })

  const timePoint = baselineEnergy[currentTimeIndex] ?? baselineEnergy[0]

  const simulatedBuildings = useMemo(() => {
    // 현재는 mock JSON과 시나리오 값을 조합해 건물별 소비량/위험도를 계산하게 했음
    // 추후 FastAPI 연결할 때 buildings, baselineEnergy, scenario를 API 요청/응답으로 교체하면 됩니다.
    const currentStatus = simulateBuildingStatus(buildings, timePoint, scenario)
    return applyLoadBalancing(currentStatus, scenario)
  }, [scenario, timePoint])

  const selectedBuilding =
    simulatedBuildings.find((building) => building.id === selectedBuildingId) ??
    simulatedBuildings[0]

  const selectedTimeline = useMemo(
    () => buildEnergyTimeline(selectedBuilding, baselineEnergy, scenario),
    [scenario, selectedBuilding],
  )

  useEffect(() => {
    if (!selectedBuildingId && buildings[0]) {
      setSelectedBuildingId(buildings[0].id)
    }
  }, [selectedBuildingId])

  return (
    <DashboardLayout
      buildings={simulatedBuildings}
      selectedBuilding={selectedBuilding}
      selectedBuildingId={selectedBuildingId}
      currentTimeIndex={currentTimeIndex}
      scenario={scenario}
      timeline={selectedTimeline}
      timePoints={baselineEnergy}
      onScenarioChange={setScenario}
      // When a building is clicked in the digital twin, update selectedBuildingId
      // 디지털트윈 3D 건물을 클릭하면 이 콜백으로 선택 건물 ID를 올려주면 됨
      onBuildingSelect={setSelectedBuildingId}
      // currentTimeIndex drives building status, chart, KPI, and alert feed
      // 재생바의 시간 index가 바뀌면 건물 상태, KPI, 차트, 경고 피드가 모두 다시 계산됩니다 ㅎㅎ,,
      onTimeIndexChange={setCurrentTimeIndex}
    />
  )
}

export default App
