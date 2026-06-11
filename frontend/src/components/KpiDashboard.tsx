import type { Building, BuildingState } from '../city/types'

type KpiDashboardProps = {
  buildings: Building[]
  buildingStates: BuildingState[]
  selectedBuildingId: number | null
}

export function KpiDashboard({
  buildings,
  buildingStates,
  selectedBuildingId,
}: KpiDashboardProps) {

  const stateMap = new Map(
    buildingStates.map((s) => [s.building_id, s])
  )

  const totalLoad = buildingStates.reduce((sum, b) => sum + b.load_kw, 0)

  const avgLoad =
    buildingStates.length > 0
      ? Math.round(totalLoad / buildingStates.length)
      : 0

  const dangerCount = buildingStates.filter(b => b.risk === 'danger').length
  const warningCount = buildingStates.filter(b => b.risk === 'warning').length

  const selectedBuilding = buildings.find(
    b => b.building_id === selectedBuildingId
  )

  const selectedState = buildingStates.find(
    b => b.building_id === selectedBuildingId
  )

  return (
    <section className="panel kpi-panel">
      <div className="panel-title">KPI Dashboard</div>

      <div className="kpi-grid">
        <article className="kpi-card">
          <span>Total Load</span>
          <strong>{totalLoad.toLocaleString()}</strong>
          <small>kW</small>
        </article>

        <article className="kpi-card">
          <span>Average Load</span>
          <strong>{avgLoad}</strong>
          <small>kW</small>
        </article>

        <article className="kpi-card danger">
          <span>Danger</span>
          <strong>{dangerCount}</strong>
        </article>

        <article className="kpi-card caution">
          <span>Warning</span>
          <strong>{warningCount}</strong>
        </article>
      </div>

      {selectedBuilding && selectedState && (
        <div className={`selected-summary ${selectedState.risk}`}>
          <div>
            <span>Selected</span>
            <strong>{selectedBuilding.display_name}</strong>
          </div>

          <dl>
            <div>
              <dt>Type</dt>
              <dd>{selectedBuilding.building_type}</dd>
            </div>

            <div>
              <dt>Load</dt>
              <dd>{selectedState.load_kw} kW</dd>
            </div>

            <div>
              <dt>Status</dt>
              <dd>{selectedState.risk}</dd>
            </div>
          </dl>
        </div>
      )}
    </section>
  )
}