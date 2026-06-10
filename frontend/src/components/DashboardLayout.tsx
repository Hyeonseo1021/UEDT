import type { Dispatch, SetStateAction } from 'react'
import { AlertFeed } from './AlertFeed'
import { ControlPanel } from './ControlPanel'
import { DigitalTwinPlaceholder } from './DigitalTwinPlaceholder'
import { EnergyChart } from './EnergyChart'
import { KpiDashboard } from './KpiDashboard'
import { TimelineBar } from './TimelineBar'
import type { Building, EnergyTimePoint, ScenarioControls, TimelinePoint } from '../types/energy'

type DashboardLayoutProps = {
  buildings: Building[]
  selectedBuilding: Building
  selectedBuildingId: string
  currentTimeIndex: number
  scenario: ScenarioControls
  timeline: TimelinePoint[]
  timePoints: EnergyTimePoint[]
  onScenarioChange: Dispatch<SetStateAction<ScenarioControls>>
  onBuildingSelect: (id: string) => void
  onTimeIndexChange: (timeIndex: number) => void
}

export function DashboardLayout({
  buildings,
  selectedBuilding,
  selectedBuildingId,
  currentTimeIndex,
  scenario,
  timeline,
  timePoints,
  onScenarioChange,
  onBuildingSelect,
  onTimeIndexChange,
}: DashboardLayoutProps) {
  return (
    <main className="dashboard-shell">
      {/* 상단 상태 영역: 보고있는 화면 제목과 현재 선택된 건물/시간을 보여줌. */}
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Energy Control Center</p>
          <h1>Digital Twin Energy Dashboard</h1>
        </div>
        <div className="header-status">
          <span>Current {timePoints[currentTimeIndex]?.timeLabel}</span>
          <strong>{selectedBuilding.name}</strong>
        </div>
      </header>

      <section className="dashboard-grid">
        {/* 좌측 패널: 사용자가 바꾸는 시나리오 조건 */}
        <ControlPanel
          currentTimeIndex={currentTimeIndex}
          scenario={scenario}
          timePoints={timePoints}
          onScenarioChange={onScenarioChange}
          onTimeIndexChange={onTimeIndexChange}
        />

        <section className="city-column">
          {/* 중앙 영역: 현재는 임의로 넣어둔 2D 상자 이미지, 추후 3D Canvas 컴포넌트로 교체될 구간. */}
          <DigitalTwinPlaceholder
            buildings={buildings}
            selectedId={selectedBuildingId}
            currentTimeIndex={currentTimeIndex}
            onBuildingClick={onBuildingSelect}
          />
          {/* 하단 재생바: 시간 흐름 시뮬레이션을 제어 */}
          <TimelineBar
            currentTimeIndex={currentTimeIndex}
            timePoints={timePoints}
            onTimeIndexChange={onTimeIndexChange}
          />
        </section>

        <aside className="right-rail">
          {/* 우측 패널: 선택된 건물과 현재 시간 기준으로 계산된 관제 정보 확인 가능 */}
          <KpiDashboard buildings={buildings} selectedBuilding={selectedBuilding} />
          <EnergyChart timeline={timeline} currentTimeIndex={currentTimeIndex} />
          <AlertFeed buildings={buildings} />
        </aside>
      </section>
    </main>
  )
}
