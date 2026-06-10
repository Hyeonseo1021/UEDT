import type { Building } from '../types/energy'

type KpiDashboardProps = {
  buildings: Building[]
  selectedBuilding: Building
}

const zoneLabel = {
  residential: 'Residential',
  commercial: 'Commercial',
  industrial: 'Industrial',
}

export function KpiDashboard({ buildings, selectedBuilding }: KpiDashboardProps) {
  const totalLoad = buildings.reduce((sum, building) => sum + (building.predictedConsumption ?? 0), 0)
  const averageLoadRate = Math.round(
    buildings.reduce((sum, building) => sum + (building.loadRate ?? 0), 0) / buildings.length,
  )
  const riskCount = buildings.filter((building) => building.riskLevel === 'danger').length
  const cautionCount = buildings.filter((building) => building.riskLevel === 'caution').length

  return (
    <section className="panel kpi-panel">
      <div className="panel-title">KPI Dashboard</div>
      <div className="kpi-grid">
        <article className="kpi-card">
          <span>Total Load</span>
          <strong>{totalLoad.toLocaleString()}</strong>
          <small>kWh</small>
        </article>
        <article className="kpi-card">
          <span>Average Load</span>
          <strong>{averageLoadRate}%</strong>
          <small>rate</small>
        </article>
        <article className="kpi-card danger">
          <span>Risk Count</span>
          <strong>{riskCount}</strong>
          <small>danger</small>
        </article>
        <article className="kpi-card caution">
          <span>Caution Count</span>
          <strong>{cautionCount}</strong>
          <small>moderate</small>
        </article>
      </div>

      <div className={`selected-summary ${selectedBuilding.riskLevel ?? 'normal'}`}>
        <div>
          <span>Selected Building</span>
          <strong>{selectedBuilding.name}</strong>
        </div>
        <dl>
          <div>
            <dt>Zone</dt>
            <dd>{zoneLabel[selectedBuilding.zone]}</dd>
          </div>
          <div>
            <dt>Load</dt>
            <dd>{selectedBuilding.loadRate}%</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{selectedBuilding.riskLevel}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
