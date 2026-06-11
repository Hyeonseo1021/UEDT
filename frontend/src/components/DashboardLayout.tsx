import type { Building, BuildingState } from '../city/types'
import { AlertFeed } from './AlertFeed'
import { ControlPanel } from './ControlPanel'
import { CityScene } from '../city/CityScene'
import { EnergyChart } from './EnergyChart'
import { KpiDashboard } from './KpiDashboard'
import { TimelineBar } from './TimelineBar'

type DashboardLayoutProps = {
  buildings: Building[]
  buildingStates: BuildingState[]   // 🔥 추가
  selectedBuildingId: number | null
  currentTimeIndex: number
  maxTimeIndex: number
  onBuildingSelect: (id: number) => void
  onTimeIndexChange: (timeIndex: number) => void
  center: { x: number; z: number }
  selectedDate: string
  onDateChange: (date: string) => void
}

export function DashboardLayout({
  buildings,
  buildingStates,
  selectedBuildingId,
  currentTimeIndex,
  onBuildingSelect,
  maxTimeIndex,
  onTimeIndexChange,
  selectedDate,
  onDateChange,
  center
}: DashboardLayoutProps) {

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <h1>Digital Twin Energy Dashboard</h1>
      </header>

      <section className="dashboard-grid">

        <ControlPanel
          currentTimeIndex={currentTimeIndex}
          maxTimeIndex={maxTimeIndex}
          selectedDate={selectedDate}
          onDateChange={onDateChange}
          onTimeIndexChange={onTimeIndexChange}
        />

        <section className="city-column">
          <CityScene
            buildings={buildings}
            buildingStates={buildingStates}   
            selectedId={selectedBuildingId}
            viewMode="status"
            onBuildingClick={onBuildingSelect}
            currentTimeIndex={currentTimeIndex}
            center={center}
          />

          <TimelineBar
            currentTimeIndex={currentTimeIndex}
            maxTimeIndex={maxTimeIndex}
            onTimeIndexChange={onTimeIndexChange}
          />
        </section>

        <aside className="right-rail">

          <KpiDashboard
            buildings={buildings}
            buildingStates={buildingStates}
            selectedBuildingId={selectedBuildingId}
          />

          <EnergyChart
            buildingStates={buildingStates}
          />

          <AlertFeed
            buildings={buildings}
            buildingStates={buildingStates}
          />

        </aside>
      </section>
    </main>
  )
}